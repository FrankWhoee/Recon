# Recon
Webiste Adaptation of Recon Bolt the discord bot. Helps you find good days to hike. To use, just go to https://reconbolt.herokuapp.com

## How to Deploy (Linux or MacOS)
1. `git clone https://github.com/FrankWhoee/Recon.git`
2. `cd Recon`
3. `python3 -m venv venv` *(Recommended)*
4. `pip install -r -requirements.txt`
5. `source venv/bin/activate`
6. Create an API key at http://openweathermap.org/
7. `echo "weather-token:[YOUR-OPENWEATHERMAP-KEY]`<br>
`secret-key:[RANDOM-STRING]" >> config.yaml`
7. `python3 app.py`
8. To verify that Recon is working, go to https://localhost
