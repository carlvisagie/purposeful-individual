# Vapi API Notes

## Phone Number Creation (Correct Format)

From docs: https://docs.vapi.ai/quickstart/phone

### TypeScript Server SDK Example:

```typescript
const res = await fetch('https://api.vapi.ai/phone-number', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    provider: 'vapi',
    assistantId: 'your-assistant-id',
    numberDesiredAreaCode: '415',
  }),
});
```

### Key Points:
- Use `assistantId` (NOT `fallbackDestination.assistantId`)
- Direct field, not nested object
- Provider is 'vapi' for free US numbers

### Correct SDK Usage:

```typescript
const phoneNumber = await vapi.phoneNumbers.create({
  provider: "vapi",
  assistantId: assistant.id,  // Direct field!
  numberDesiredAreaCode: "415", // Optional
});
```

## Error We Got:
```
"fallbackDestination.property assistantId should not exist"
```

This means we used the wrong structure. Should be `assistantId` directly, not nested in `fallbackDestination`.
