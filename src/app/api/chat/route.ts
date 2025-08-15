import { NextRequest, NextResponse } from 'next/server';
import { v0 } from 'v0-sdk';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let message: string | null = null;
    let chatId: string | null = null;
    let attachments: any[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      message = (formData.get('message') as string) || '';
      chatId = (formData.get('chatId') as string) || null;
      const files = formData.getAll('files') as File[];
      attachments = files.map((file) => ({ file }));
    } else {
      const body = await request.json();
      message = body.message;
      chatId = body.chatId || null;
      attachments = body.attachments || [];
    }

    if (!message && attachments.length === 0) {
      return NextResponse.json(
        { error: 'Message or attachments are required' },
        { status: 400 },
      );
    }

    let catalogueData = null;

    // Add attachment information and generate products if attachments exist
    if (attachments.length > 0) {
      const firstAttachment = attachments[0];
      const input = firstAttachment?.file || firstAttachment;
      const catalogue = await generateProductCatalogueFromImage(message!, input);

      if (catalogue) {
        // Transform catalogue to the desired format and create a readable string for LLM
        catalogueData = `<PRODUCT_CATALOGUE>
${catalogue.products.map((product: any, index: number) =>
          `<PRODUCT id="${index + 1}">
<NAME>${product.name}</NAME>
<DESCRIPTION>${product.description}</DESCRIPTION>
<IMAGE_URL>${product.imageUrl || 'No image available'}</IMAGE_URL>
</PRODUCT>`
        ).join('\n')}
</PRODUCT_CATALOGUE>`;
      }
    }

    const ENHANCED_USER_PROMPT = `You are a Shopify expert. Create a viral pop-up store landing page.

Build a single-page Next.js store with:
- Eye-catching hero section with trend-themed design
- Simple product grid showing 4-6 items with prices
- No need to add things like "Add to favorites" or "Add to cart"
- Quick "Buy Now" buttons for each product
- The "Buy Now" button should open a modal with a checkout form ( the pay function can be mocked )
- Minimal navigation (just logo and NO Shopping cart)
- Mobile-first responsive design
- Trendy colors and bold typography
- No testimonials
- Social sharing buttons
- Images are important, make sure to create all the images you need and don't use placeholder images

Focus on: Simple, fast, impulse-buy experience. No complex menus or pages.

Here is the catalogue of products: ${catalogueData}.

Now, create the store for: ${message}.`;

    let chat;

    const userMessage: string = message ?? '';

    if (chatId) {
      // continue existing chat
      chat = await v0.chats.sendMessage({
        chatId: chatId as string,
        message: userMessage,
        modelConfiguration: {
          modelId: 'v0-gpt-5',
          imageGenerations: false,
          thinking: false,
        },
      });
    } else {
      // create new chat
      chat = await v0.chats.create({
        system: 'You are an expert in creating viral pop-up stores.',
        message: ENHANCED_USER_PROMPT,
        modelConfiguration: {
          modelId: 'v0-gpt-5',
          imageGenerations: false,
          thinking: false,
        },
      });
    }

    return NextResponse.json({
      id: chat.id,
      demo: chat.demo,
      files: chat.files || [],
    });
  } catch (error) {
    console.error('V0 API Error:', error);

    // Provide more specific error information
    let errorMessage = 'Failed to process request';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 },
    );
  }
}


async function generateProductCatalogueFromImage(_userInput: string, _attachment: any): Promise<any | null> {
  // Mock data for now
  try {

    // ---- System prompt template you can extend ----
    const BASE_SYSTEM_PROMPT = `
You are a data extractor that outputs only what the schema asks for.
Infer product-like entries from the user's text and the provided image.
Keep values concise and useful for storefront UI.
`;

    // Optional: add more context/instructions at runtime via env or other source
    const EXTRA_SYSTEM_CONTEXT = process.env.GENERATOR_CONTEXT ?? "";

    // Optional: extra generation instructions appended to the user turn
    const EXTRA_INSTRUCTIONS = `
Return realistic placeholder prices if not present (e.g., "AUD 29.90").
If an image URL is unknown, synthesize a descriptive path-like URL from the name.
`;

    // JSON schema for structured outputs (strict)
    const productSchema = {
      name: "product_list",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["items"],
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["name", "description", "imageurl", "price"],
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                imageurl: { type: "string" },
                price: { type: "string" },
              },
            },
          },
        },
      },
    } as const;

    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n${EXTRA_SYSTEM_CONTEXT}`.trim();

    const inputContent: any[] = [];
    inputContent.push({ type: "input_text", text });
    if (imageDataUrl) {
      inputContent.push({ type: "input_image", image: imageDataUrl });
    }
    if (EXTRA_INSTRUCTIONS) {
      inputContent.push({ type: "input_text", text: EXTRA_INSTRUCTIONS });
    }

    const response = await client.responses.create({
      // Pick a current multimodal model you have access to
      model: process.env.OPENAI_MODEL ?? "gpt-5", // e.g. "gpt-4.1" or "gpt-4o"
      input: [
        {
          role: "system",
          content: [{ type: "text", text: systemPrompt }],
        },
        {
          role: "user",
          content: inputContent,
        },
      ],
      response_format: { type: "json_schema", json_schema: productSchema },
      // You can also set max_output_tokens if you expect a large list
      // max_output_tokens: 2048,
    });

    // With structured outputs, the SDK exposes a parsed result:
    // @ts-expect-error: types may lag behind SDK; output_parsed is present at runtime
    const parsed = response.output_parsed ?? null;

    // Fallback if parsed is missing (defensive)
    const raw =
      // @ts-expect-error
      response.output?.[0]?.content?.[0]?.text ??
      // @ts-expect-error
      response.output_text ??
      null;

    const payload =
      parsed ??
      (raw ? JSON.parse(raw) : { items: [] });

    return Response.json(payload, { status: 200 });



  } catch (error) {
    return {
      products: [
        {
          id: '1',
          name: 'Premium Sneakers',
          price: 129.99,
          description: 'High-quality athletic footwear with modern design',
          category: 'Footwear',
          imageUrl: '/mock-sneaker.jpg'
        },
        {
          id: '2',
          name: 'Vintage Jacket',
          price: 89.99,
          description: 'Stylish vintage-inspired outerwear',
          category: 'Clothing',
          imageUrl: '/mock-jacket.jpg'
        },
        {
          id: '3',
          name: 'Smart Watch',
          price: 199.99,
          description: 'Advanced fitness tracking and notifications',
          category: 'Electronics',
          imageUrl: '/mock-watch.jpg'
        }
      ],
      totalProducts: 3,
      categories: ['Footwear', 'Clothing', 'Electronics']
    };
  }
}