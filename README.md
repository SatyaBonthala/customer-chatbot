# **🛒 Customer Service Chatbot**  
**Built with SvelteKit, LangChain, and Groq LLaMA3**  

### **📌 Overview**  
The **Customer Service Chatbot** is an AI-powered assistant that helps users with:  
✔️ **Order tracking**  
✔️ **Complaint handling**  
✔️ **Product inquiries**  
✔️ **FAQ support**  
✔️ **Order cancellation**  

It uses **Groq's LLaMA3-70B** model for intelligent responses and integrates **tool calls** to fetch real-time order and shipment details.

---

## **🚀 Features**  
✅ **AI-powered conversations** with memory retention  
✅ **Order status tracking** (via `checkOrder` tool)  
✅ **Shipment updates** (`trackShipment` tool)  
✅ **Product information retrieval** (`getProductInfo` tool)  
✅ **FAQ-based responses** (`getFAQ` tool)  
✅ **Support ticket creation** (`createTicket` tool)  
✅ **Product availability checks** (`checkAvailability` tool)  
✅ **SvelteKit frontend** with an interactive chat UI  
✅ **Groq's LLaMA3 model for fast, intelligent responses**  

---

## **🛠️ Tech Stack**  
- **Frontend**: [SvelteKit](https://kit.svelte.dev/)  
- **Backend**: [SvelteKit API Routes](https://kit.svelte.dev/docs/routing)  
- **AI Model**: [Groq LLaMA3-70B](https://groq.com/)  
- **Memory**: [LangChain `BufferMemory`](https://js.langchain.com/docs/modules/memory/)  
- **Vector Database**: Uses in-memory chat history  
- **Deployment**: Can be hosted on **Vercel, Netlify, or a Node.js server**  

---

## **📂 Project Structure**  

```
customer-service-chatbot/
│── src/
│   ├── routes/
│   │   ├── api/
│   │   │   ├── chat/  # API for chatbot
│   │   │   │   ├── +server.js  # Chatbot logic with LangChain & Groq
│   │   ├── chat/  # Chat UI frontend
│   │   │   ├── +page.svelte  # Chat interface
│   ├── lib/  # Utility functions (if needed)
│── static/  # Static assets
│── .env  # API Keys
│── package.json  # Project dependencies
│── README.md  # Project documentation
```

---

## **📦 Installation & Setup**  

### **1️⃣ Clone the Repository**  
```sh
git clone https://github.com/yourusername/customer-service-chatbot.git
cd customer-service-chatbot
```

### **2️⃣ Install Dependencies**  
```sh
npm install
```

### **3️⃣ Configure API Keys**  
Create a **`.env`** file in the root directory and add:

```
GROQ_API_KEY=your_groq_api_key_here
```
Replace `"your_groq_api_key_here"` with your **actual API key** from [Groq](https://groq.com/).

### **4️⃣ Start the Development Server**  
```sh
npm run dev
```
Now, open your browser at **`http://localhost:5173/chat`** to start chatting! 🎉

---

## **🛠️ How It Works**  

### **Backend (`+server.js`)**
- The chatbot **uses Groq's LLaMA3-70B** to process customer queries.  
- It **stores conversation history** in `BufferMemory`, enabling context retention.  
- **Tool calls** allow the chatbot to fetch real-time **order status, shipment tracking, product details, FAQs, and ticket creation**.  

### **Frontend (`+page.svelte`)**
- **SvelteKit UI** provides a clean and interactive **chat interface**.  
- Users **send messages**, which are **processed by `+server.js`** and displayed dynamically.  

---

## **📝 Available Tool Calls**
The chatbot supports **6 tools** to fetch real-time customer support data.

| **Tool Name**       | **Purpose**                                  | **Arguments**                 |
|---------------------|--------------------------------|-------------------------------|
| `checkOrder`       | Get the status of an order    | `{ "orderId": "12345" }`      |
| `trackShipment`    | Track a package               | `{ "trackingId": "ABC123" }`  |
| `getProductInfo`   | Retrieve product details      | `{ "productId": "P1" }`       |
| `getFAQ`          | Fetch FAQ responses           | `{ "topic": "returns" }`      |
| `createTicket`     | Create a support ticket      | `{ "issue": "damaged item", "priority": "high" }` |
| `checkAvailability`| Check product stock          | `{ "productId": "P1" }`       |

---

## **🌐 Deployment**
### **Deploy on Vercel (Recommended)**
```sh
npm install -g vercel
vercel
```

### **Deploy on Netlify**
```sh
netlify deploy
```

### **Run on a Node.js Server**
```sh
node build
```

---

## **💡 Future Improvements**  
🚀 Integrate a **database (MongoDB/PostgreSQL)** for persistent user history.  
🚀 Add **voice assistant capabilities**.  
🚀 Improve **multilingual support**.  

---

## **📝 License**  
This project is open-source under the **MIT License**.  

---

## **👨‍💻 Author**  
**Your Name** – [GitHub](https://github.com/yourusername) | [LinkedIn](https://linkedin.com/in/yourname)  

