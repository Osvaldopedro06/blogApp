const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//model usuario
require('../models/Usuario')
const Usuario = mongoose.model('Usuario')


module.exports = function(passport){

    //configurando todo o sistema de autenticação
    passport.use(new localStrategy({usernameField : 'txtEmail', usernameField : 'txtSenha'}, (email, senha, done) => {

        //pesquisando pelo usuario
        Usuario.findOne({email : email}).then((usuario) => {

            //se nao achar o usuario
            if(!usuario){
                return done(null, false, {message : 'Essa conta não existe'})
            }

            //se a conta existe

            //compara a senha digitada com a senha do usuario do banco
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                
                //se as senhas forem iguais, retorna o valor do usuário
                if(batem){
                    return done(null, usuario)
                } else{
                    return done(null, false, {message : 'Senha incorreta'})
                }

            })
        })
    }))

    //salvar os dados do usuário numa sessao
    passport.serializeUser((usuario, done) => {

        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {

        //procura o usuario pela sua id
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })
}