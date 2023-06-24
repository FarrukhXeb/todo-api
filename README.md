# Todo API

## Requirements

- Node >= 18.12.1
- Yarn
- MySQL

## Getting Started

```
yarn install
yarn db:up # getting DB ready and migrating the tables
yarn db:seed # seeding the DB with custom data
```
Create a `.env` file in the root directory and add the environment variables just like given in the `.env.example` file.

## Testing
Using `jest` and `supertest` for testing the API(s)
```
yarn test
```