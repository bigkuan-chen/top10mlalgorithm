

async function check() {
  try {
    const res = await fetch('https://top10mlalgorithm.vercel.app/');
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("Contains AiAssistant component or trigger?", html.includes('ai-assistant-trigger') || html.includes('ML 演算法助教'));
    console.log("Contains local API call?", html.includes('localhost:8000'));
    
    // Find script tags
    const scriptRegex = /<script src="([^"]+)"/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(html)) !== null) {
      scripts.push(match[1]);
    }
    console.log("Scripts:", scripts);
  } catch (e) {
    console.error(e);
  }
}

check();
