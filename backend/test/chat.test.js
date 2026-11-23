import assert from "node:assert/strict";
import test from "node:test";
import { askQuestion } from "../src/controllers/chatController.js";
import Chunk from "../src/models/Chunk.js";

const fileId = "1234567890abcdef12345678";

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; },
  };
}

test("only the five closest excerpts from the selected file reach the answer prompt", async t => {
  const otherFileId = "1234567890abcdef12345679";
  const chunks = [
    { fileId: otherFileId, text: "foreign excerpt", embedding: [1, 0] },
    { fileId, text: "opposite excerpt", embedding: [-100, 0] },
    { fileId, text: "distant excerpt", embedding: [1, 5] },
    { fileId, text: "middle excerpt", embedding: [1, 1] },
    { fileId, text: "closest excerpt", embedding: [1, 0] },
    { fileId, text: "near excerpt", embedding: [2, 1] },
    { fileId, text: "further excerpt", embedding: [1, 2] },
  ];
  t.mock.method(Chunk, "find", filter => {
    assert.deepEqual(filter, { fileId });
    return { lean: async () => chunks.filter(chunk => chunk.fileId === filter.fileId) };
  });
  let prompt;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).endsWith(":embedContent")) {
      return Response.json({ embedding: { values: [1, 0] } });
    }
    assert.ok(String(url).endsWith(":generateContent"));
    prompt = JSON.parse(options.body).contents[0].parts[0].text;
    return Response.json({ candidates: [{ content: { parts: [{ text: "The answer" }] } }] });
  });

  const res = response();
  await askQuestion({ body: { fileId, question: "What happened?" } }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { answer: "The answer" });
  assert.match(prompt, /closest excerpt\n\nnear excerpt\n\nmiddle excerpt\n\nfurther excerpt\n\ndistant excerpt/);
  assert.doesNotMatch(prompt, /foreign excerpt|opposite excerpt/);
});

test("chat rejects incomplete requests and files with no indexed text", async t => {
  const find = t.mock.method(Chunk, "find", () => ({ lean: async () => [] }));
  const fetch = t.mock.method(globalThis, "fetch", () => assert.fail("Unexpected Gemini request"));
  for (const body of [undefined, { question: "What?" }, { fileId, question: "   " },
    { question: "What?", fileId: "invalid" }]) {
    const res = response();
    await askQuestion({ body }, res);
    assert.equal(res.statusCode, 400);
  }
  assert.equal(find.mock.callCount(), 0);

  const res = response();
  await askQuestion({ body: { fileId, question: "What?" } }, res);
  assert.equal(res.statusCode, 422);
  assert.equal(fetch.mock.callCount(), 0);
});
