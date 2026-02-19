const ENV = {
    dev: {
        apiUrl: 'http://localhost:3000/api',
    },
    prod: {
        apiUrl: 'https://civickit.loca.lt/api', //localtunnel URL, should be replaced later
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