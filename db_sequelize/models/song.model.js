const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    sequelize.define('song',{
        
        song_id: {
            type: DataTypes.INTEGER,
        },
        name: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        numberTrack: {
            type: DataTypes.INTEGER,
        },
        album: {
            type: DataTypes.STRING,
        },
        disc: {
            type: DataTypes.INTEGER,
        },
        artist: {
            type: DataTypes.STRING,
        },   
        genre: {
            type: DataTypes.STRING,
        },
        year: {
            type: DataTypes.INTEGER,
        },
        path: {
            type: DataTypes.TEXT,
        }
    });

};