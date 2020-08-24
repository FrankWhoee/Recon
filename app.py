import os
import json
from flask import Flask, request, render_template, send_from_directory, session, flash, redirect, Response
import math
import yaml
from requests import get
import time

app = Flask(__name__)

if os.path.exists("config.yaml"):
    with open(r'config.yaml') as file:
        config = yaml.load(file, Loader=yaml.FullLoader)
else:
    config = {
        "weather-token": os.environ["weather-token"],
        "secret-key": os.environ["secret-key"]
    }

app.secret_key = config['secret-key'].encode('utf8')

recipes = []
icons = []

search_index = []

default_preferences = {
    'dewp': 50,
    'maxtemp': 50,
    'morntemp': 50,
    'clouds': 50,
    'uvi': 50,
    'pop': 50,
    'idewp': 14.17,
    'imaxtemp': 20,
    'imorntemp': 17.5,
    'iclouds': 50,
    'iuvi': 0,
    'ipop': 0
}


def set_default_preferences():
    for pref in default_preferences.keys():
        session[pref] = default_preferences[pref]


@app.route('/assets/<path>')
def send_assets(path):
    return send_from_directory('assets', path)


@app.route('/style/<path>')
def send_style(path):
    return send_from_directory('style', path)


@app.route('/js/<path>')
def send_js(path):
    return send_from_directory('js', path)


@app.route('/fonts/<path>')
def send_fonts(path):
    return send_from_directory('fonts', path)


@app.route('/')
def index():
    for pref in default_preferences.keys():
        if pref not in session:
            session[pref] = default_preferences[pref]
    return render_template("index.html")

@app.route('/magic')
@app.route('/sausage')
@app.route('/works')
@app.route('/how')
def howitworks():
    return render_template("howitworks.html")


@app.route('/data')
def get_data():
    if 'lat' not in request.args or 'long' not in request.args:
        return Response(status=400)
    if "score_sorted" in request.args and request.args["score_sorted"] == "true":
        return json.dumps(get_weather(request.args['lat'], request.args['long'], score_sorted=True,
                                      units=request.args["units"] if "units" in request.args else "metric"))
    else:
        return json.dumps(get_weather(request.args['lat'], request.args['long']))

@app.route('/update_pref', methods=['POST'])
def update_preferences():
    for pref in request.json.keys():
        session[pref] = float(request.json[pref])
    return "{}"

@app.route('/pref')
def get_preferences():
    output = {}
    for pref in default_preferences.keys():
        output[pref] = session[pref]
    return json.dumps(output)

@app.route('/reset_pref')
def reset_preferences():
    set_default_preferences()
    return get_preferences()


def get_weather(lat, long, score_sorted=False, units="metric"):
    if 'cache' not in session or abs(time.time() - session['cache']['dt']) > 3600 or abs(float(lat) - float(session['cache']['lat'])) > 0.2 or abs(float(long) - float(session['cache']['long'])) > 0.2:
        r = get(
            "https://api.openweathermap.org/data/2.5/onecall?lat=" + str(lat) + "&lon=" + str(long) + "&appid=" +
            config['weather-token'] + "&units=" + units)
        weather_data = json.loads(r.text)
        session["cache"] = {"dt": time.time(), 'data':weather_data, 'lat': lat, 'long': long}
    else:
        weather_data = session['cache']['data']

    scores = []
    for day in weather_data["daily"]:
        score = 0
        detail = {}
        detail["dt"] = day["dt"]
        detail["icon"] = 'http://openweathermap.org/img/wn/' + day["weather"][0]["icon"] + '@2x.png'
        # Dew point score
        dewp = 0
        if day["dew_point"] > session['idewp'] + 1.39:
            dewp = day["dew_point"] - session['idewp'] + 1.39
        elif day["dew_point"] < session['idewp'] - 1.39:
            dewp = session['idewp'] - 1.39 - day["dew_point"]
        dewp *= 2 * session['dewp'] / 50
        score += dewp

        detail['dew_point'] = day["dew_point"]

        # Temperature score
        maxtemp = 0
        if day["temp"]["max"] > session['imaxtemp'] + 5:
            maxtemp = day["temp"]["max"] - session['imaxtemp'] + 5
        elif day["temp"]["max"] < session['imaxtemp'] - 5:
            maxtemp = session['imaxtemp'] - 5 - day["temp"]["max"]
        maxtemp *= 3 * session['maxtemp'] / 50
        score += maxtemp

        detail['maxtemp'] = day["temp"]["max"]

        # Temperature score
        morntemp = 0
        if day["temp"]["morn"] > session['imorntemp'] + 2.5:
            morntemp = day["temp"]["morn"] - session['imorntemp'] + 2.5
        elif day["temp"]["morn"] < session['imorntemp'] - 2.5:
            morntemp = session['imorntemp'] - 2.5 - day["temp"]["morn"]
        morntemp *= 1.5 * session["morntemp"] / 50
        score += morntemp

        detail['morntemp'] = day["temp"]["morn"]

        # Cloudiness score
        clouds = abs(session['iclouds'] - day["clouds"])
        clouds *= 0.09 * session["clouds"] / 50
        score += clouds

        detail['clouds'] = day["clouds"]

        # UVI score
        uvi = abs(session['iuvi'] - day['uvi'])
        uvi *= 0.5 * session["uvi"] / 50
        score += uvi

        detail['uvi'] = day["uvi"]

        # Probability of Precipiation score'
        pop = abs(session["ipop"]/100 - day["pop"])
        pop *= 100 * session["pop"] / 50
        score += pop

        detail['pop'] = day["pop"]
        detail['score'] = score

        if score < 50:
            colour = '#%02x%02x%02x' % (int(255 * (score / 50)), 255, 0)
        elif score >= 50 and score <= 100:
            colour = '#%02x%02x%02x' % (255, int(255 * (1 - ((score - 50) / 50))), 0)
        else:
            colour = '#ff0000'

        detail["colour"] = colour

        scores.append(detail)
    if score_sorted:
        return sorted(scores, key=lambda k: k['score'])
    else:
        return scores


if __name__ == '__main__':
    app.run(debug=True)
