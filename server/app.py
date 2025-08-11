import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from flask import Flask, request, Response, send_from_directory
from flask_cors import CORS
from routes.items import items_blueprint
from routes.beacons import beacons_blueprint
from routes.keys import keys_blueprint
from routes.login import login_blueprint
from routes.influxdb import influxdb_blueprint
import config
from flask_migrate import Migrate
from db import db
from werkzeug.middleware.proxy_fix import ProxyFix

# Initialize Flask app
app = Flask(__name__)


USE_PROXY = os.getenv("USE_PROXY", "false").lower() == "true"
if USE_PROXY:
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# Enable CORS
CORS(app)

@app.before_request
def basic_authentication():
    if request.method.lower() == 'options':
        return Response()

# Load configuration
app.config.from_object(config.Config)

# Initialize the database
db.init_app(app)  # Initialize the db with the app
Migrate(app, db)

# Register blueprints (routes)
app.register_blueprint(items_blueprint, url_prefix='/api/items')
app.register_blueprint(beacons_blueprint, url_prefix='/api/beacons')
app.register_blueprint(keys_blueprint, url_prefix='/api/keys')
app.register_blueprint(login_blueprint, url_prefix='/api/login')
app.register_blueprint(influxdb_blueprint, url_prefix='/api/influxdb')


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True, port=8000)
