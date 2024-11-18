from flask import Flask, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from flask import Flask, jsonify, request

app = Flask(__name__)

# Flask-MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'  # Change this if needed
app.config['MYSQL_USER'] = 'root'  # Replace with your MySQL username
app.config['MYSQL_PASSWORD'] = 'hi'  # Replace with your MySQL password
app.config['MYSQL_DB'] = 'SkyHighAirlines'  # Replace with your database name

mysql = MySQL(app)

# Enable CORS for all routes, but you can restrict this to specific origins if needed
CORS(app, origins="http://localhost:3000")  # Allow requests from localhost:3000 (your frontend)

@app.route('/api/flights', methods=['GET'])
def get_all_flights():
    query = """
        SELECT f_id, arrival_time, departure_time, origin, destination, num_seats, status, distance, flight_type
        FROM FLIGHT
        WHERE status  IN ('Scheduled', 'Delayed')
        ORDER BY departure_time ASC
    """
    
    cur = mysql.connection.cursor()
    cur.execute(query)
    flights = cur.fetchall()

    flight_list = [
        {
            'f_id': flight[0],
            'arrival_time': flight[1].strftime('%Y-%m-%d %H:%M:%S'),  # Format datetime
            'departure_time': flight[2].strftime('%Y-%m-%d %H:%M:%S'),
            'origin': flight[3],
            'destination': flight[4],
            'num_seats': flight[5],
            'status': flight[6],
            'distance': flight[7],
            'flight_type': flight[8]
        }
        for flight in flights
    ]

    # Don't forget to close the cursor
    cur.close()

    return jsonify(flight_list)

@app.route('/api/seats/<int:flight_id>', methods=['GET'])
def get_seats(flight_id):
    query = """
        SELECT 
            class,
            COUNT(*) AS total_seats
        FROM 
            SEATS
        WHERE 
            flight_id = %s
        GROUP BY 
            class
        ORDER BY 
            class ASC;
    """
    
    cur = mysql.connection.cursor()
    cur.execute(query, (flight_id,))
    result = cur.fetchall()

    # Don't forget to close the cursor
    cur.close()

    return jsonify([
        {
            'class': row[0],
            'total_seats': row[1]
        }
        for row in result
    ])
@app.route('/api/book-seat', methods=['POST'])
def book_seat():
    data = request.json
    print("hello world")
    print(data)
    query = "SELECT * FROM PASSENGER WHERE email = %s"
    cur = mysql.connection.cursor()
    print(data['email'])
    cur.execute(query, (data['email'],))
    
    existing_passenger = cur.fetchone()
    
    cur.close()

    if existing_passenger:
        return jsonify({"message": "Passenger already exists", "passenger_id": existing_passenger[0]}), 409

    try:
        # Insert new passenger into database
        query = """
            INSERT INTO PASSENGER (passenger_id, dob, gender, email, name, passport_id, country, street, city, phone_no)
            VALUES(6, '2018-01-01', 'Female', 'gurram13775@gmail.com', 'Shreya', '12345A', 'India', '123Shreya', 'blr', '9901618208');
        """
        cur = mysql.connection.cursor()
        
        cur.execute(query)

        # Get the new passenger_id (if needed)
        new_passenger_id = cur.lastrowid
        
        # Insert booking for the new passenger
        query1 = """
            INSERT INTO BOOKING (book_id, book_timestamp, status, amount, seat_pref, class, passenger_id, seat_id, is_redeem) 
            VALUES (6, NOW(), 'Confirmed', 500.00, 'Window', 'Business', %s, 3, 0);
        """
        cur.execute(query1, (new_passenger_id,))  # Use the new_passenger_id in the booking query

        # Commit the changes
        mysql.connection.commit()

        # Close the cursor
        cur.close()

        return jsonify({
            "message": "Seat booked successfully",
            "passenger_id": new_passenger_id,
            "seat_class": data['class']
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)

