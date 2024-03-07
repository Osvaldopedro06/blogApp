const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('Usuario')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
    res.render('usuario/registro')
})

router.post('/registro', (req, res) => {
    const erros = []

    //verifica se a senha tem menos que 8 caracteres
    if(req.body.txtSenha.length < 6){
        erros.push({texto: 'Senha muito curta'})
    }

    //verifica se os campos de senha têm os mesmos valores
    if(req.body.txtSenha != req.body.txtSenha2){
        erros.push({texto: 'A senha de confirmação está incorreta. Por favor, insira a senha correta digitada no campo Senha'})
    }

    if(erros.length > 0){
        res.render('usuario/registro', {erros : erros})
    } else{
        //verifica se o email ja não existe no banco
        Usuario.findOne({email : req.body.txtEmail}).then((usuario) => {
            
            if(usuario){
                req.flash('error_msg', 'Este e-mail não pode ser usado por que já existe uma conta com o mesmo email.')
                res.redirect('/usuario/registro')
            } else{
                    //salva
                    const novoUsuario = {
                        nome: req.body.txtNome,
                        email: req.body.txtEmail,
                        senha: req.body.txtSenha
                    }
                    // fazendo hash no valor da senha
                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                            if(erro){
                                req.flash('error_msg', 'Houve um erro ao criar a sua conta')
                                res.redirect('/')
                            }

                            //gera o hash da senha inserida
                            novoUsuario.senha = hash

                            //salvar
                            new Usuario(novoUsuario).save().then(() => {
                                req.flash('success_msg', 'Sua conta foi criada')
                                res.redirect('/')
                            }).catch((erro) => {
                                req.flash('error_msg', 'Houve um erro ao cria a sua conta. Tente novamente')
                                res.redirect('/usuario/registro')
                            })
                        })
                    })
                }
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro ao carregar a página')
            res.redirect('/')
        })
    }
})

//login
    router.get('/login', (req, res) => {
        res.render('usuario/login')
    })

    /*autenticação de login
    router.post('/login', (req, res, next) => {

        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/usuario/login',
            failureFlash: true
        })(req, res, next)
    }) */

     //autenticação de login
     router.post('/login', 
        passport.authenticate('local', {
            failureRedirect: '/usuario/login',
            failureFlash: 'Usuário ou senha inválida',
            function(req, res){
                req.flash('success_msg', 'Você está logado!')
                res.redirect('/')
            }
        }))



module.exports = router