<script>
    import { goto } from "$app/navigation";
    const features = [
        {
            title: "Instant Responses",
            description: "Get immediate answers to your questions, 24/7, without waiting in queue.",
            icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
        },
        {
            title: "Order Tracking",
            description: "Track your orders and get real-time updates on shipping status.",
            icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>',
        },
        {
            title: "Product Information",
            description: "Get detailed information about products, availability, and pricing.",
            icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        },
    ];

    const steps = [
        {
            title: "Start Chat",
            description: "Click the chat button to begin your conversation with our AI assistant.",
        },
        {
            title: "Ask Questions",
            description: "Type your question or select from common queries for quick answers.",
        },
        {
            title: "Get Help",
            description: "Receive immediate assistance and solutions to your queries.",
        },
    ];
</script>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Hero Section -->
    <header class="px-4 py-16 sm:px-6 sm:py-24 lg:px-8 max-w-7xl mx-auto">
        <div class="text-center">
            <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                24/7 Customer Support
                <span class="text-blue-600">AI Assistant</span>
            </h1>
            <p class="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                Get instant answers to your questions, track orders, and resolve issues - all
                through our intelligent chat interface.
            </p>
            <div class="mt-10 flex items-center justify-center gap-x-6">
                <button
                    on:click={() => goto("/chat")}
                    class="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
                >
                    Start Chatting
                </button>
            </div>
        </div>
    </header>

    <!-- Features Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {#each features as feature}
                <div
                    class="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div
                        class="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4"
                    >
                        {@html feature.icon}
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                    </h3>
                    <p class="text-gray-600">
                        {feature.description}
                    </p>
                </div>
            {/each}
        </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 px-4 bg-gray-50">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
            <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {#each steps as step, i}
                    <div class="flex flex-col items-center text-center">
                        <div
                            class="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4"
                        >
                            {i + 1}
                        </div>
                        <h3 class="text-lg font-semibold mb-2">{step.title}</h3>
                        <p class="text-gray-600">{step.description}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-100 py-12 mt-12">
        <div class="max-w-7xl mx-auto px-4 text-center text-gray-600">
            <p>© 2024 Customer Support AI. All rights reserved.</p>
        </div>
    </footer>
</div>
