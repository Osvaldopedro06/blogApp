const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')
const Schema = mongoose.Schema

const UsuarioSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    admin: {
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        required: true
    }
})

mongoose.model('Usuario', UsuarioSchema)