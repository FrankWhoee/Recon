import os
import json
from flask import Flask, request, render_template, send_from_directory, session, flash, redirect, Response
import math
import yaml
from requests import get

app = Flask(__name__)

app.secret_key = 'Zli6WMDUEboJnp34fzwK'.encode('utf8')

recipes = []
icons = []

search_index = []

with open(r'config.yaml') as file:
    config = yaml.load(file, Loader=yaml.FullLoader)


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
    return render_template("index.html")


@app.route('/data')
def get_data():
    if 'lat' not in request.args or 'long' not in request.args:
        return Response(status=400)
    if "score_sorted" in request.args and request.args["score_sorted"] == "true":
        return json.dumps(get_weather(request.args['lat'], request.args['long'], score_sorted=True,
                                      units=request.args["units"] if "units" in request.args else "metric"))
    else:
        return json.dumps(get_weather(request.args['lat'], request.args['long']))


def get_weather(lat, long, score_sorted=False, units="metric"):
    r = get(
        "https://api.openweathermap.org/data/2.5/onecall?lat=" + str(lat) + "&lon=" + str(long) + "&appid=" + config[
            'weather-token'] + "&units=" + units)
    weather_data = json.loads(r.text)
    scores = []
    for day in weather_data["daily"]:
        score = 0
        detail = {}
        detail["dt"] = day["dt"]
        detail["icon"] = 'http://openweathermap.org/img/wn/' + day["weather"][0]["icon"] + '@2x.png'
        # Dew point score
        dewp = 0
        if day["dew_point"] > 15.56:
            dewp = day["dew_point"] - 15.56
        elif day["dew_point"] < 12.78:
            dewp = 12.78 - day["dew_point"]
        dewp *= 2
        score += dewp

        detail['dew_point'] = day["dew_point"]

        # Temperature score
        maxtemp = 0
        if day["temp"]["max"] > 25:
            maxtemp = day["temp"]["max"] - 25
        elif day["temp"]["max"] < 15:
            maxtemp = 15 - day["temp"]["max"]
        maxtemp *= 3
        score += maxtemp

        detail['maxtemp'] = day["temp"]["max"]

        # Temperature score
        morntemp = 0
        if day["temp"]["morn"] > 20:
            morntemp = day["temp"]["morn"] - 20
        elif day["temp"]["morn"] < 15:
            morntemp = 15 - day["temp"]["morn"]
        morntemp *= 1.5
        score += morntemp

        detail['morntemp'] = day["temp"]["morn"]

        # Cloudiness score
        clouds = 0
        optimal_cloudiness = 50
        if day["clouds"] > optimal_cloudiness:
            clouds = (day["clouds"] - optimal_cloudiness)
        elif day["clouds"] < optimal_cloudiness:
            clouds = (optimal_cloudiness - day["clouds"])
        clouds *= 0.09
        score += clouds

        detail['clouds'] = day["clouds"]

        # UVI score
        uvi = day["uvi"] * 0.5
        score += uvi

        detail['uvi'] = day["uvi"]

        # Probability of Precipiation score
        pop = day["pop"] * 100
        score += pop

        detail['pop'] = day["pop"]
        detail['score'] = score

        if score < 50:
            colour = '#%02x%02x%02x' % (int(255 * (score / 50)), 255, 0)
        elif score >= 50 and score <= 100:
            colour = '#%02x%02x%02x' % (255, int(255 * (1 - ((score["score"] - 50) / 50))), 0)

        detail["colour"] = colour

        scores.append(detail)
    if score_sorted:
        return sorted(scores, key=lambda k: k['score'])
    else:
        return scores


if __name__ == '__main__':
    app.run(debug=True)
