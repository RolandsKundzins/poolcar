# How to use

go to https://console.cloud.google.com/google/maps-apis and get api key
You need to enable javascript maps api and directions api
iekš navigate.tsx - nomaini "YOUR_GOOGLE_MAPS_API_KEY"

- after clonning need to initialize:
```sh
npm install
```

- create database:
go through scripts in ./models/db
create .env file. Example:
```
SESSION_SECRET=ababfdsjhfsd

MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=''
MYSQL_DATABASE=POOLCAR
```

- To see in browser:
```sh
npm run dev
```


# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`
#   p o o l c a r 
 
 