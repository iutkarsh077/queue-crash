# Templates

Use these only when the user asks for a spec, brief, or story set. Keep SKILL.md rules (word list, two users).

## Feature spec (`features/<name>.md`)

```markdown
# [Feature name]

[One sentence. Who does what.]

## Who uses this feature

The [owner | guest] uses this feature on `[path]`.

## What the [owner | guest] does

1. ...
2. ...

## What the API does

Route: `[METHOD] /api/...`

1. ...

## Fail path

If ... the page or API ...

## Files

- `src/...`
```

## User story

```markdown
As a [owner | guest], I [action], so that [job].

Given [current screen or state]
When [action]
Then [visible result using word list]
```

## Product decision

```markdown
## User
owner | guest

## Job
...

## Smallest change
...

## Out of scope
...

## Success
...

## Copy
Button: ...
Status: ...
Empty/error: ...
```

## Marketing brief

```markdown
## Audience
owner | guest (pick one)

## Promise
Show a token. Scan the QR. We tell you when it is ready.

## Proof
- ...

## CTA
[Log in with Google | Create order | Notify me]

## Use
token, order, queue, ready, log in

## Avoid
sign in, ticket, line, ETA, customer
```

## Copy table

| Screen | Element | Copy |
| --- | --- | --- |
| Guest order | Title | Your order |
| Guest order | Chip (Preparing) | Waiting |
| Guest order | Text (Preparing) | Preparing |
| Guest order | Chip (Ready) | Ready |
| Guest order | Text (Ready, food) | Your food is ready. |
| Guest order | Text (Ready, barber) | Your turn |
| Push | Title | Your food is ready |
| Push | Body | token [N] |
