// mobile/src/config/env.tsx
import local from './env.local.json'

const ENV = {
    dev: {
        // apiUrl: 'http://localhost:3000/api',
        apiUrl: 'http://' + local.domain + ':3000/api' //use this when no network errors
<<<<<<< 75-create-navigation-bar-component
        // apiUrl: 'https://quarters-elections-idea-restaurants.trycloudflare.com'+'/api' //cloudflare tunnel URL, should be replaced later
=======
        //apiUrl: 'https://consumer-evening-ends-britain.trycloudflare.com'+'/api' //cloudflare tunnel URL, should be replaced later
>>>>>>> main
    },
    prod: {
        apiUrl: 'https://civickit.loca.lt/api', //localtunnel URL, should be replaced later
        //apiUrl: 'https://civickit.org/api'
    },
};


const getEnvVars = () => {
    console.log(__DEV__)
    if (__DEV__) {
        return ENV.dev;
    }
    return ENV.prod;
};

export default getEnvVars();