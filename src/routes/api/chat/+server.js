import { ChatGroq } from '@langchain/groq';
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { GROQ_API_KEY, POSTGRES_URL } from '$env/static/private';
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
                    'P1': 'Premium Widget - $99.99 (50 in stock)',
                    'P2': 'Basic Widget - $49.99 (100 in stock)',
                    'P3': 'Super Widget - $149.99 (25 in stock)',
                    'P4': 'Ultra Widget - $199.99 (10 in stock)',
                    'P5': 'Mini Widget - $29.99 (200 in stock)'
                };
                return products[productId] || 'Product not found';
            },
            getFAQ: async ({ topic }) => {
                try {

                    const result = await pool.query(
                        `SELECT * FROM faqs WHERE topic = $1`,
                        [topic]
                    );

                    if (result.rows.length > 0) {
                        return result.rows[0].response;
                    }

                    return "I apologize, but I couldn't find specific information about that topic. Could you try rephrasing your question or ask about something else?";
                } catch (error) {
                    console.error("❌ Database Query Error:", error);
                    return "Sorry, I encountered an error while fetching the FAQ information. Please try again later.";
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


