# The Idea Board, not the repo, is the source of truth for Core Ideas

Core Ideas and their statuses live in the Idea Board (a published Claude Artifact with its own shared database), not as markdown files or GitHub Issues in this repo. The Human Gate must be usable in seconds from a phone by a non-developer, which repo files and issue labels are not. Asset Production reads Approved Core Ideas from the Idea Board's database, so moving this store later means migrating data and changing that integration.

## Considered Options

- **Markdown files in the repo:** rejected; approving means editing a `Status:` line through Git.
- **GitHub Issues with labels:** rejected; workable on mobile but clumsy for reviewing many ideas, and mixes content decisions with engineering tickets.
