<script>
    import { onMount } from "svelte";

    let chatHistory = [];
    let userMessage = "";
    let isLoading = false;
    let chatContainer;

    onMount(() => {
        scrollToBottom();
    });

    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    $: if (chatHistory.length) {
        setTimeout(scrollToBottom, 100);
    }

    const sendMessage = async () => {
        if (!userMessage.trim()) return;
        isLoading = true;
        chatHistory = [...chatHistory, { sender: "User", content: userMessage }];
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: chatHistory,
                    modelId: "llama3-70b-8192",
                }),
            });
            const data = await res.json();
            chatHistory = [...chatHistory, { sender: "Bot", content: data.message }];
        } catch (error) {
            chatHistory = [...chatHistory, { sender: "Bot", content: "Error fetching response." }];
        }
        userMessage = "";
        isLoading = false;
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !isLoading) {
            sendMessage();
        }
    };

    const suggestions = [
        { text: "track order #", hint: "Use order/tracking number", example: "track order #12345" },
        { text: "check stock", hint: "Use product ID (e.g., P1, P2)", example: "check stock P1" },
        { text: "shipping info", hint: "Get shipping policy", example: "shipping info" },
        { text: "returns", hint: "Return policy", example: "returns" },
        {
            text: "create ticket",
            hint: "Create support ticket",
            example: "create ticket: order issue",
        },
    ];

    function handleSuggestionClick(suggestion) {
        userMessage = suggestion.example;
        // Focus the input after setting the text
        document.querySelector('input[type="text"]').focus();
    }
</script>

<div class="flex flex-col h-screen bg-[#f5f7fb]">
    <header class="bg-white shadow-sm px-6 py-4 flex items-center fixed top-0 w-full z-10">
        <div class="flex items-center space-x-4">
            <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span class="text-white font-medium">CS</span>
            </div>
            <div>
                <h1 class="text-lg font-semibold text-gray-800">Customer Support</h1>
                <div class="flex items-center">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span class="text-sm text-gray-500 ml-2">Online</span>
                </div>
            </div>
        </div>
    </header>

    <main class="flex-1 overflow-hidden pt-[76px]">
        <div class="h-full flex flex-col max-w-3xl mx-auto px-4">
            <!-- Chat Messages -->
            <div
                class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                bind:this={chatContainer}
            >
                {#each chatHistory as chat, i (i)}
                    <div
                        class="flex items-end gap-2 {chat.sender === 'User'
                            ? 'justify-end'
                            : 'justify-start'}"
                        in:fly={{ y: 20, duration: 300 }}
                    >
                        {#if chat.sender === "Bot"}
                            <div
                                class="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center"
                            >
                                <span class="text-white text-sm">CS</span>
                            </div>
                        {/if}

                        <div
                            class="flex flex-col {chat.sender === 'User'
                                ? 'items-end'
                                : 'items-start'}"
                        >
                            <div
                                class="max-w-[80%] px-4 py-2 rounded-2xl shadow-sm
                                {chat.sender === 'User'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none'}"
                            >
                                <p class="text-sm whitespace-pre-wrap leading-relaxed">
                                    {chat.content}
                                </p>
                            </div>
                            <span class="text-xs text-gray-400 mt-1">
                                {new Date().toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    </div>
                {/each}

                {#if isLoading}
                    <div class="flex items-center gap-2 text-gray-400">
                        <div class="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Updated Suggestions Box -->
            <div class="px-4 py-2 bg-blue-50 rounded-lg mb-2">
                <p class="text-blue-600 font-medium mb-2 text-sm">Quick actions:</p>
                <div class="flex flex-wrap gap-2">
                    {#each suggestions as suggestion}
                        <button
                            on:click={() => handleSuggestionClick(suggestion)}
                            class="group relative text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-full text-sm transition-colors duration-200 flex items-center gap-1"
                        >
                            <span>{suggestion.text}</span>
                            <svg
                                class="w-4 h-4 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                            <!-- Tooltip -->
                            <div
                                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                            >
                                {suggestion.hint}
                                <div
                                    class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"
                                ></div>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Input Area -->
            <div class="p-4 bg-white border-t">
                <div class="flex items-center gap-2 max-w-3xl mx-auto">
                    <input
                        type="text"
                        bind:value={userMessage}
                        on:keypress={handleKeyPress}
                        placeholder="Type your message..."
                        class="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                        on:click={sendMessage}
                        disabled={isLoading || !userMessage.trim()}
                        class="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {#if isLoading}
                            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle
                                    class="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    stroke-width="4"
                                    fill="none"
                                />
                                <path
                                    class="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        {:else}
                            <svg
                                class="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    d="M22 2L11 13"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M22 2L15 22L11 13L2 9L22 2Z"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 12px 16px;
        background: white;
        border-radius: 20px;
        width: fit-content;
    }

    .typing-indicator span {
        width: 6px;
        height: 6px;
        background: #93a3b8;
        border-radius: 50%;
        animation: bounce 1.5s infinite;
    }

    .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
    }
    .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes bounce {
        0%,
        60%,
        100% {
            transform: translateY(0);
        }
        30% {
            transform: translateY(-4px);
        }
    }

    :global(*) {
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 transparent;
    }

    :global(*::-webkit-scrollbar) {
        width: 6px;
    }

    :global(*::-webkit-scrollbar-track) {
        background: transparent;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background-color: #cbd5e1;
        border-radius: 3px;
    }
</style>
