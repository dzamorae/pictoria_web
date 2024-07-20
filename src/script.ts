document.addEventListener('DOMContentLoaded', () => {
  async function generateImage(prompt: string): Promise<string> {
    const response = await fetch('/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  }

  const form = document.getElementById('imageForm') as HTMLFormElement;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const promptInput = document.getElementById('prompt') as HTMLInputElement;
    const resultDiv = document.getElementById('result') as HTMLDivElement;
    try {
      const imageUrl = await generateImage(promptInput.value);
      resultDiv.innerHTML = `<img src="${imageUrl}" alt="Generated Image" class="img-fluid"/>`;
    } catch (error) {
      if (error instanceof Error) {
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
      } else {
        resultDiv.innerHTML = `<p>Unexpected error</p>`;
      }
    }
  });

  const micButton = document.getElementById('micButton') as HTMLButtonElement;
  micButton.addEventListener('click', () => {
    const recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      (document.getElementById('prompt') as HTMLInputElement).value = transcript;
    };
    recognition.start();
  });
});
