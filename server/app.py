from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from flask import Flask
from routes.tags import tags_blueprint
from routes.keys import keys_blueprint
from sqlalchemy import inspect  # Import the inspect function from SQLAlchemy
import config
from db import db  # Import db from the new db.py

# Initialize Flask app
app = Flask(__name__)

# Load configuration
app.config.from_object(config.Config)

# Initialize the database
db.init_app(app)  # Initialize the db with the app

# Register blueprints (routes)
app.register_blueprint(tags_blueprint, url_prefix='/tags')
app.register_blueprint(keys_blueprint, url_prefix='/keys')

# Run the app
if __name__ == '__main__':
    with app.app_context():
        # Check if tables already exist before trying to create them
        inspector = inspect(db.engine)
        if not inspector.has_table('tag') or not inspector.has_table('key'):
            db.create_all()  # Create the tables if they don't exist
        else:
            print("Tables already exist. Skipping table creation.")
    
    app.run(debug=True)