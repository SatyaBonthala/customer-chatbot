import { ChatGroq } from '@langchain/groq';
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { GROQ_API_KEY,POSTGRES_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { Pool } from '@neondatabase/serverless';


let model;
let chain;
let memory;

const pool = new Pool({ connectionString: POSTGRES_URL });
const SYSTEM_PROMPT = `You are a customer service AI. Be direct and concise. Only use tools when explicitly requested.
Use tool calls in this format: <tool_call>{"name": "tool_name", "arguments": {}}</tool_call>

You also engage in general small talk, like greetings, but always guide the conversation back to customer support.
Example:
User: Hello
Assistant: Hi! I'm Alex, your customer service assistant. How can I help you today?

User: How are you?
Assistant: I'm great! Thanks for asking. How can I assist you with your order or support questions?;


ou help users with queries about orders, shipping, returns, and support.

If a user asks about **returns, shipping, warranty, or other FAQs**, use the tool:
<tool_call>{"name": "getFAQ", "arguments": {"topic": "<topic>"}}</tool_call>

Example:
User: What is your returns policy?
Assistant: <tool_call>{"name": "getFAQ", "arguments": {"topic": "returns"}}</tool_call>

If the user asks a general question (e.g., "hello", "how are you"), respond naturally.

Available tools:
- checkOrder: Checks order status (args: orderId) - Use when order number is provided
- trackShipment: Gets shipping updates (args: trackingId) - Use when tracking number is provided
- getProductInfo: Gets product details (args: productId) - Use when product ID is mentioned
- getFAQ: Returns FAQ information (args: topic) - Use for policy questions
- createTicket: Creates support ticket (args: issue, priority) - Use when support ticket is requested
- checkAvailability: Checks product stock (args: productId) - Use when stock check is requested

Do not add any greeting or additional text. Simply:
1. Identify the required tool from user's input
2. Make the tool call
3. Return only the tool's response`;

async function handleToolCall(response, memory) {
    const start = response.indexOf("<tool_call>") + "<tool_call>".length;
    const end = response.indexOf("</tool_call>");
    const toolCallJson = response.slice(start, end).trim();

    try {
        const toolCall = JSON.parse(toolCallJson);
        const toolName = toolCall.name;
        const args = toolCall.arguments;

        const toolActions = {
            checkOrder: async ({ orderId }) => {
                // Simulated order status
                const statuses = ['processing', 'shipped', 'delivered', 'pending'];
                return `Order #${orderId} is currently ${statuses[Math.floor(Math.random() * statuses.length)]}`;
            },
            trackShipment: async ({ trackingId }) => {
                // Simulated tracking info
                const locations = ['warehouse', 'in transit', 'local facility', 'out for delivery'];
                return `Tracking #${trackingId} - Package is ${locations[Math.floor(Math.random() * locations.length)]}`;
            },
            getProductInfo: async ({ productId }) => {
                // Simulated product database
                const products = {
                    'P1': { name: 'Premium Widget', price: '$99.99', stock: 50 },
                    'P2': { name: 'Basic Widget', price: '$49.99', stock: 100 },
                    'P3': { name: 'Super Widget', price: '$149.99', stock: 25 }
                };
                return products[productId] || 'Product not found';
            },
            getFAQ: async ({ topic }) => {
                try {
                    console.log("🔍 Searching FAQ for:", topic);
            
                    const client = await pool.connect();
                    const result = await client.query(
                        'SELECT * FROM faqs WHERE LOWER(topic) = LOWER($1) LIMIT 1',
                        [topic.trim()]
                    );
                    client.release();
            
                    if (result.rows.length) {
                        console.log("✅ Found FAQ Response:", result.rows[0].response);
                        return result.rows[0].response;
                    } else {
                        console.log("⚠️ No matching FAQ found.");
                        return "Sorry, I couldn't find information on that topic.";
                    }
                } catch (error) {
                    console.error("❌ Database Query Error:", error);
                    return "Error retrieving FAQ information.";
                }
            },
            createTicket: async ({ issue, priority }) => {
                // Simulated ticket creation
                const ticketId = Math.floor(Math.random() * 10000);
                return `Ticket #${ticketId} created for: ${issue} (Priority: ${priority})`;
            },
            checkAvailability: async ({ productId }) => {
                // Simulated inventory check
                const stock = Math.floor(Math.random() * 100);
                return `Product ${productId} has ${stock} units in stock`;
            }
        };

        if (toolName in toolActions) {
            const result = await toolActions[toolName](args);
            // Return only the tool result, without the original response
            return result;
        } else {
            return `Tool "${toolName}" not available.`;
        }
    } catch (error) {
        console.error('Tool call error:', error);
        return `Error: ${error.message}`;
    }
}

export async function POST({ request }) {
    try {
        const { message, history, modelId } = await request.json();

        model = new ChatGroq({
            model: 'llama3-70b-8192',
            apiKey: GROQ_API_KEY
        });

        const prompt = PromptTemplate.fromTemplate(`
            {system_message}
            Current conversation:
            {chat_history}
            Human: {input}
            Assistant: `);

        memory = new BufferMemory({
            returnMessages: true,
            memoryKey: "chat_history",
            inputKey: "input"
        });

        chain = new ConversationChain({
            llm: model,
            memory: memory,
            prompt,
            inputKeys: ["input", "system_message"]
        });

        if (history?.length > 0) {
            await memory.clear();
            for (let i = 0; i < history.length - 1; i += 2) {
                const userMessage = new HumanMessage(history[i].content);
                const aiMessage = new AIMessage(history[i + 1].content);
                await memory.chatHistory.addMessage(userMessage);
                await memory.chatHistory.addMessage(aiMessage);
            }
        }

        const response = await chain.call({
            input: message,
            system_message: SYSTEM_PROMPT
        });

        let finalResponse = response.response;

        // Check for tool calls in the response
        if (response.response.includes("<tool_call>")) {
            finalResponse = await handleToolCall(response.response, memory);
        }

        return json({ message: finalResponse });
    } catch (error) {
        console.error('Error:', error);
        return json({ error: 'Failed to get response' }, { status: 500 });
    }
}


