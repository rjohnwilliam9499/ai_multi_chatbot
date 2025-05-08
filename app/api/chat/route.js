export async function POST(request) {
  const { messages, model } = await request.json();
  let role,
    content,
    modalUrlKey,
    modalKeyKey,
    modalUrl,
    modalKey,
    modalNameKey,
    modalName;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
    });
  } else {
    role = messages[messages.length - 1].role;
    content = messages[messages.length - 1].content;
    modalUrlKey = `${model}_API_MODAL`;
    modalKeyKey = `${model}_API_KEY`;
    modalNameKey = `${model}_API_NAME`;

    modalUrl = process.env[modalUrlKey];
    modalKey = process.env[modalKeyKey];
    modalName = process.env[modalNameKey];
  }
  try {
    const ress = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${modalKey}`,
        "HTTP-Referer": "<YOUR_SITE_URL>",
        "X-Title": "<YOUR_SITE_NAME>",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modalUrl,
        messages: [
          {
            role: role,
            content: content,
          },
        ],
      }),
    });
    const data = await ress.json();
    if (!ress.ok) {
      console.error("OpenRouter error:", data);
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
      });
    } else {
      let reply = data.choices[0].message.content;
      return new Response(
        JSON.stringify({ reply: reply, modalName: modalName ? modalName : "OpenRouter" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("OpenRouter error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
}
