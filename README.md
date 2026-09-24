# Building the Centralized Exchange 

I will be Building this project end to end buy hand written code
- I will be using the Cursor as IDE and its auto complete feature (not for the core modules)

I will be learning the concepts and implement them on my own

I will Iterate over the project with new Improvements and new featurs

### Project Structure

This project will be a monorepo with typescipt as the programming language and folow the below folder structure

`/apps` It will include all independent codebases
- backend
- frontend
- ws server
- engin

`/packages` for the shared code

# Engin

- Understood the concept of the engine

### Engine durability TODO

- [x] Step 1: Periodic + shutdown snapshot (`snapshot.json`)
- [x] Step 2: Event log between snapshots (`events.jsonl`)
- [ ] Step 3: Redis processing list (`order` → `order:processing`) so a crash mid-message does not drop the job
