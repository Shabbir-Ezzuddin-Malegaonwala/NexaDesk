from langchain_core.prompts import ChatPromptTemplate

classify_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a support ticket classifier. Analyze the ticket and return ONLY a JSON object with no extra text.

The JSON must have exactly these fields:
- priority: one of "low", "medium", "high", "critical"
- category: one of "billing", "technical", "account", "feature_request", "bug_report"
- confidence: a float between 0.0 and 1.0
- reasoning: a brief one sentence explanation

Priority guidelines:
- critical: system down, data loss, security breach
- high: major feature broken, blocking work
- medium: feature partially working, workaround exists
- low: minor issue, cosmetic, question

Return ONLY the JSON object, no markdown, no explanation."""),
    ("human", "Title: {title}\nDescription: {description}")
])

suggest_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful support agent writing a response to a customer ticket.
Tone: {tone}

Write a clear, helpful, and empathetic response. Be concise but thorough.
Do not include subject lines or greetings like "Dear Customer".
Start directly with the response content."""),
    ("human", """Ticket Title: {title}
Ticket Description: {description}
Category: {category}
Priority: {priority}

Previous Comments:
{comments}

Write a helpful support response:""")
])