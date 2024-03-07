const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('Categoria')
require('../models/Postagem')
const Postagem = mongoose.model('Postagem')

//admin router
router.get('/', (req, res) => {
    res.render('admin/index')
})

//routas das categorias

    //listagem de categorias
        router.get('/categorias', (req, res) => {
            Categoria.find().sort({data: 'desc'}).then((object) => {
                res.render('admin/categorias', {object: object})
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao carregar os dados da categoria')
                res.redirect('/admin')
            })
        })

    //rota adicionar categoria
        router.get('/categorias/add', (req, res) => {
            res.render('admin/addcategorias')
        })

    // metodo post onde salva uma nova categoria
        router.post('/categorias/nova', (req, res) => {
            //validação do formulário
            const erros = []

            if(!req.body.txtNome || typeof req.body.txtNome == undefined || req.body.txtNome == null){
                erros.push({texto: 'Nome da categoria Inválido'})
            }

            if(req.body.txtNome.length < 3){
                erros.push({texto: 'Nome da categoria pequeno demais.'})
            }

            if(!req.body.txtSlug || typeof req.body.txtSlug == undefined || req.body.txtSlug == null){
                erros.push({texto: 'Slug Inválido'})
            }

            //verificar se a array é maior que zero
            if(erros.length > 0){
                res.render('admin/addcategorias', {erros: erros})
            } else{
                    //add new categoria
                    const newCategoria = {
                        nome: req.body.txtNome,
                        slug: req.body.txtSlug
                    }

                    new Categoria(newCategoria).save().then(() => {
                        req.flash('success_msg', 'Categoria criada com sucesso!')
                        res.redirect('/admin/categorias')
                    }).catch((erro) => {
                        req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente.')
                        res.redirect('/admin')
                    })
                }
        })
    
    //editar categoria
        router.get('/categorias/edit/:id', (req, res) => {
            //pesquisando o registro pela id
            Categoria.findOne({_id : req.params.id}).then((object) => {
                res.render('admin/editcategorias', {object : object})
            }).catch((erro) => {
                req.flash('error_msg', 'A categoria não existe.')
                res.redirect('/admin/categorias')
            })
        })

    // passando os novos dados da categoria
        router.post('/categorias/edit', (req, res) => {
            
                Categoria.findOne({_id : req.body.txtId}).then((object) => {
                
                object.nome = req.body.txtNome
                object.slug = req.body.txtSlug

                object.save().then(() => {
                    req.flash('success_msg', 'Categoria alterada com sucesso')
                    res.redirect('/admin/categorias')
                }).catch((erro) => {
                    req.flash('error_msg', 'Houve um erro ao alterar os dados da categoria')
                    res.redirect('/admin/categorias')
                })
            }).catch((erro) => {
                    req.flash('error_msg', 'Erro ao atualizar os dados da categoria')
                    res.redirect('/admin/categorias')
                })
        })

    //deletar categoria
        router.get('/categorias/deletar/:id', (req, res) => {
            Categoria.deleteOne({_id : req.params.id}).then(() => {
                req.flash('success_msg', 'Categoria eliminada com sucesso')
                res.redirect('/admin/categorias')
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro ao eliminar a categoria')
                res.redirect('/admin/categorias')
            })
        })
    
// routas das postagens
    //listagem de postagens
        router.get('/postagens', (req, res) => {
            Postagem.find().populate('categoria').sort({data : 'desc'}).then((postagens) => {
                res.render('admin/postagens', {postagens : postagens})
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro ao listar as postagens')
                res.redirect('/admin')
            })
        })
    
    //nova postagem
        router.get('/postagens/add', (req, res) => {
            Categoria.find().sort({nome : 'asc'}).then((categorias) => {
                res.render('admin/addpostagens', {categorias : categorias})
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro ao carregar o formulário')
                res.redirect('/admin')
            })
        })
    
    //salvando a nova postagem
        router.post('/postagens/nova', (req, res) => {
            //validação
            const erros = []

            if(!req.body.txtTitulo ||  typeof req.body.txtTitulo == undefined || req.body.txtTitulo == null){
                erros.push({texto : 'Título inválido'})
            }

            if(!req.body.txtSlug ||  typeof req.body.txtSlug == undefined || req.body.txtSlug == null){
                erros.push({texto : 'Slug inválido'})
            }

            if(!req.body.txtDescricao ||  typeof req.body.txtDescricao == undefined || req.body.txtDescricao == null){
                erros.push({texto : 'Descrição inválida'})
            }

            if(!req.body.txtConteudo ||  typeof req.body.txtConteudo == undefined || req.body.txtConteudo == null){
                erros.push({texto : 'Conteúdo inválido'})
            }

            if(req.body.txtConteudo.length < 10){
                erros.push({texto : 'Conteúdo pequeno demais'})
            }

            if(req.body.txtCategoria == '0'){
                erros.push({texto : 'Categoria inválida'})
            }

            if(erros.length > 0){
                res.render('admin/addpostagens', {erros : erros})
            } else {
                //salva nova postagem
                const novaPostagem = {
                    titulo: req.body.txtTitulo,
                    slug: req.body.txtSlug,
                    descricao: req.body.txtDescricao,
                    conteudo: req.body.txtConteudo,
                    categoria: req.body.txtCategoria
                }

                new Postagem(novaPostagem).save().then(() => {
                    req.flash('success_msg', 'Postagem criada com sucesso')
                    res.redirect('/admin/postagens')

                }).catch((erro) => {
                    req.flash('error_msg', 'Houve um erro ao criar a postagem')
                    res.redirect('/admin/postagens')
                })
            }
        })

    //editando/alterando postagem
        router.get('/postagens/edit/:id', (req, res) => {
            Postagem.findOne({_id : req.params.id}).then((postagem) => {
                Categoria.find().then((categorias) => {
                res.render('admin/editpostagens', {categorias : categorias, postagem : postagem})
            }).catch((erro) => {
                    req.flash('error_msg', 'Houve um erro ao listar as categorias')
                    res.redirect('/admin/postagens')
                })
            
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro ao carregar o formulário para atualizar a postagem')
                res.redirect('/admin/postagens')
            })
        })
    
    //passando novos dados na postagem
        router.post('/postagens/edit', (req, res) => {
            
            const erros = []

            if(req.body.txtCategoria == '0' || req.body.txtCategoria == 0){
                erros.push({texto : 'Categoria inválida'})
            }

            if(erros.length > 0){
                res.render('admin/postagens', {erros : erros})
            } else{
                Postagem.findOne({_id : req.body.txtId}).then((postagem) => {
                    postagem.titulo = req.body.txtTitulo
                    postagem.slug = req.body.txtSlug
                    postagem.descricao = req.body.txtDescricao
                    postagem.conteudo = req.body.txtConteudo
                    postagem.categoria = req.body.txtCategoria
        
                    //salva a postagem com os novos dados
                    postagem.save().then(() => {
                        req.flash('success_msg', 'Postagem alterada com sucesso')
                        res.redirect('/admin/postagens')
                    }).catch((erro) => {
                        req.flash('error_msg', 'Houve um erro ao alterar os dados da postagem')
                        res.redirect('/admin/postagens')
                    })
                }).catch((erro) => {
                    req.flash('error_msg', 'Houve um arro ao alterar os dados da postagem')
                    res.redirect('/admin/postagens')
                })
            }
        })

    //deletar postagem
        router.get('/postagens/delete/:id', (req, res) => {
            Postagem.deleteOne({_id : req.params.id}).then(() => {
                req.flash('success_msg', 'Postagem eliminada com sucesso')
                res.redirect('/admin/postagens')
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro ao eliminar a postagem')
                res.redirect('/admin/postagens')
            })
        })

        

module.exports = router