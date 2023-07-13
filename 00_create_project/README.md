# Create an application

> This section defines how to create a Next.js app 

A completed version of this part can be found in the example repository ([00_create_project](https://github.com/spruceid/sprucekit-quickstart/tree/main/00_create_project)).

Let’s create and run our Next.js app. We recommend creating a new Next.js app using create-next-app, that will automatically set up everything for you. To create an app, run:

```bash
npx create-next-app@13
```

On installation, you’ll see the following prompts:

```bash
✔ What is your project named? … my-app
✔ Would you like to use TypeScript with this project? …  Yes
✔ Would you like to use ESLint with this project? … Yes
✔ Would you like to use Tailwind CSS with this project? … No
✔ Would you like to use `src/` directory with this project? … No
✔ Use App Router (recommended)? … Yes
✔ Would you like to customize the default import alias? … No
```

After the prompts, a folder with your app name will be created, and all dependencies will be installed. 

To check whether the app has successfully been created, run the following command:

```bash
cd my-app
npm run dev
```

You now have a Next.js app ready to be integrated with SSX library. 