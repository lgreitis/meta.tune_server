echo "Launching redis server"
start cmd /k wsl redis-server

echo "Launching nats server"
start cmd /k "cd skyring-timer & nats-server.exe"

SLEEP 2

echo "Launching skyring server"
start cmd /k "cd skyring-timer & node . --channel:port=3455 --seeds="localhost:3455""

echo "Launching skyring server"
start cmd /k npm start