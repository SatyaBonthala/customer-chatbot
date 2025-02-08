import { ChatGroq } from '@langchain/groq';
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { GROQ_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";


let model;
let chain;
let memory;

const SYSTEM_PROMPT = `You are a professional customer service agent named Alex. Your role is to help customers with their queries, orders, and support needs.
When you need to use specific functions, use the tool call format:
<tool_call>{"name": "tool_name", "arguments": {}}</tool_call>

Available tools:
- checkOrder: Checks order status (args: orderId)
- trackShipment: Gets shipping updates (args: trackingId)
- getProductInfo: Gets product details (args: productId)
- getFAQ: Returns FAQ information (args: topic)
- createTicket: Creates support ticket (args: issue, priority)
- checkAvailability: Checks product stock (args: productId)

Always be polite, professional, and helpful. If you don't have specific information, use the appropriate tool to fetch it.
Start your conversation with a friendly greeting and ask how you can help.`;

async function handleToolCall(response, memory) {
    const start = response.indexOf("<tool_call>") + "<tool_call>".length;
    const end = response.indexOf("</tool_call>");
    const toolCallJson = response.slice(start, end).trim();

    try {
        const toolCall = JSON.parse(toolCallJson);
        const toolName = toolCall.name;
        const args = toolCall.arguments;
        let result = null;

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
                // Simulated FAQ database
                const faqs = {
                    'returns': 'Returns are accepted within 30 days of purchase with original receipt.',
                    'shipping': 'Standard shipping takes 3-5 business days.',
                    'warranty': 'Products come with a 1-year standard warranty.'
                };
                return faqs[topic] || 'FAQ topic not found';
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
            result = await toolActions[toolName](args);
            const originalResponse = response.replace(/<tool_call>.*<\/tool_call>/, '').trim();
            return `${originalResponse}\n${result}`;
        } else {
            return `Sorry, the tool "${toolName}" is not available.`;
        }
    } catch (error) {
        console.error('Tool call error:', error);
        return `Sorry, there was an error processing your request: ${error.message}`;
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