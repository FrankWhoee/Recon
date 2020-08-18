import os
import json
from flask import Flask, request, render_template, send_from_directory, session, flash, redirect, Response
import math

app = Flask(__name__)

app.secret_key = 'Zli6WMDUEboJnp34fzwK'.encode('utf8')

recipes = []
icons = []

search_index = []


@app.route('/assets/<path>')
def send_assets(path):
    return send_from_directory('assets', path)

@app.route('/style/<path>')
def send_style(path):
    return send_from_directory('style', path)

@app.route('/js/<path>')
def send_js(path):
    return send_from_directory('js', path)

@app.route('/')
def index():
    return render_template("index.html")