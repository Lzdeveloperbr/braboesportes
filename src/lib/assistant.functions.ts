import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const AskInput = z.object({
  question: z.string().min(1).max(2000),
  context: z.string().max(12000).default(""),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Assistente indisponível: chave de IA ausente.");

    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const { text } = await generateText({
      model: gateway("openai/gpt-5.6-sol"),
      providerOptions: { lovable: { reasoningEffort: "none" } },
      system:
        "Você é o analista de desempenho do Brabo Esporte Clube. Responda sempre em português do Brasil, " +
        "de forma objetiva, com listas curtas e recomendações práticas de treino, escalação e gestão. " +
        "Use apenas os dados fornecidos; se faltar informação, diga o que precisa ser registrado no sistema.",
      prompt: `Dados atuais do clube:\n${data.context}\n\nPergunta: ${data.question}`,
    });

    return { text };
  });
