# Alplakes React
Alplakes Website

[![License: MIT][mit-by-shield]][mit-by]

This is the front-end for the [Alplakes](https://eo4society.esa.int/projects/alplakes/) project build in React v18. Alplakes is an open-source esa funded research project aimed at providing operational products based on a combination of remote sensing and hydrodynamic models for a number of European lakes.

The online deployement can be found at https://www.alplakes.eawag.ch

![React][React] ![TypeScript][TypeScript] ![Javascript][javascript-by-shield]

## Development

### Install Node.js

Install node.js according to the official instructions https://nodejs.org/en/download

### Clone the repository

```console
git clone git@github.com:eawag-surface-waters-research/alplakes-react.git
```

### Install packages

```console
cd alplakes-react
npm install
```

### Launch the service

```console
npm start
```

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes. You may also see any lint errors in the console.

### Build a production package

```console
npm run build
```

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

## Deployement

The application is deployed using AWS Amplify. The GitHub repositority is connected to a CI/CD pipeline which rebuilds and redeploys the application on any commits to the master branch.


[mit-by]: https://opensource.org/licenses/MIT
[mit-by-shield]: https://img.shields.io/badge/License-MIT-g.svg
[javascript-by-shield]: https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E
[airflow]: https://img.shields.io/badge/Apache%20Airflow-017CEE?style=for-the-badge&logo=Apache%20Airflow&logoColor=white
[React]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[TypeScript]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
