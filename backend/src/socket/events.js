let ioInstance = null;

const initSocket = (io) => {
    ioInstance = io;
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
};

const getIo = () => {
    return ioInstance;
};

module.exports = {
    initSocket,
    getIo
};
