const express = require('express');
const request = require('request');
const hbs = require('hbs');
const fs =  require('fs')

var app = express();

hbs.registerPartials(__dirname + '/views/partials');

app.use(express.static(__dirname + '/public'));

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});

app.use((request, response, next) => {
    var time = new Date().toString();
    //console.log(`${time}: ${request.method} ${request.url}`);
    var log = `${time}: ${request.method} ${request.url}`;
    fs.appendFile('server.log', log + '\n', (error) => {
        if (error) {
            console.log('Unable to log message');
        }
    });

    response.render('construction.hbs', {
        title: 'Maintenence',
        year: new Date().getFullYear(),
        welcome: 'Sorry for the inconvenience !'
    });

git
    //next();
})


app.get('/', (request, response) => {
    response.render('main.hbs', {
        title: 'Main page',
        header: 'Main Page'
    });
});

app.get('/solmaz', (request, response) => {
    response.render('solmaz.hbs', {
        title: 'solmaz page',
        header: 'solmaz Page'
    });
});

var getCapital = (country) => {
    return new Promise((resolve, reject) => {
        request({
            url: `https://restcountries.eu/rest/v2/name/${encodeURIComponent(country)}?fullText=true`,
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to Rest Countries');
            } else if (body.status == 404) {
                reject('Cannot find requested country');
            } else if ((body[0].name).toUpperCase() == (country).toUpperCase()) {
                resolve(body[0].capital);
            }
        });
    });
};



var getTemp = (capital) => {
    return new Promise((resolve, reject) => {
        request({
            url: `http://api.openweathermap.org/data/2.5/weather?q=${capital}&units=imperial&appid=41801cbcfc459a16d83d3e646db2ed3b`,
            json: true
        }, (error, response, body) => {
            resolve(body.main.temp);
        });
    })
};

var getWind = (capital) => {
    return new Promise((resolve, reject) => {
        request({
            url: `http://api.openweathermap.org/data/2.5/weather?q=${capital}&units=imperial&appid=41801cbcfc459a16d83d3e646db2ed3b`,
            json: true
        }, (error, response, body) => {
            resolve(body.wind.speed);
        });
    })
};

country = "ance";

getCapital(country).then((result) => {
    capital = result
    return getTemp(result);
}).then((result) => {
    temp = result
    return getWind(capital);
}).then((result) => {
    wind = result
    weather = (`The weather in ${capital}, capital of ${country} is ${temp} degrees Fahrenheit with wind speed of ${wind}`);
}).catch((error) => {
    console.log('Error:', error);
    weather = "Error: Cannot find requested country";
});


// app.get('/weather', (request, response) => {
//     response.send(weather);
// });


app.get('/weather', (request, response) => {
    response.render('weather.hbs', {
        title: 'Weather page',
        header: 'Weather',
        weather: weather
    });
});


app.listen(8080, () => {
    console.log('Server is up on port 8080');
});