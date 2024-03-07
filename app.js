//carregando modulos
const express = require('express')
const handlebars = require('express-handlebars')
const Handlebars = require('handlebars')
const bodyParser = require('body-parser')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const app = express()
const admin = require('./routes/admin')
const usuario = require('./routes/usuario')
//carregando o modulo de postagem
require('./models/Postagem')
const Postagem = mongoose.model('Postagem')
//carregando o modulo de categoria
require('./models/Categoria')
const Categoria = mongoose.model('Categoria')
//arquivo da autenticacao
const passport = require('passport')


//config
    //session
        app.use(session({
            secret: 'gofo4095405ffghf',
            resave: true,
            saveUninitialized: true
        }))

    //passport
        app.use(passport.initialize())
        app.use(passport.session())
        require(path.join(__dirname, 'config/auth'))(passport)

    //flash
        app.use(flash())

    //middleware
        app.use((req, res, next) => {
            //variaveis globais de mensagem de sucesso e erro ao fazer um cadastro
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            next()
        })

    //handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main', handlebars: allowInsecurePrototypeAccess(Handlebars)}))
        app.set('view engine', 'handlebars')

    //body-parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    //public
        app.use(express.static(path.join(__dirname, 'public')))

    //mongoose
        mongoose.Promise = global.Promise
        mongoose.connect('mongodb://0.0.0.0:27017/blog').then(() => {
            console.log('Conectado ao mongodb com sucesso...')
        }).catch((erro) => {
            console.log('Erro na conexao ('+erro+').')
        })

//rotas

    //rota principal
        app.get('/', (req, res) => {
            Postagem.find().populate('categoria').sort({data : 'desc'}).then((postagens) => {
                res.render('index', {postagens : postagens})
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro ao carregar as postagens')
                res.redirect('/404')
            })
        })

    //leia mais
        app.get('/postagem/:slug', (req, res) => {
            Postagem.findOne({slug : req.params.slug}).populate('categoria').then((post) => {
                
                if(post){
                    res.render('postagem/index', {post : post})
                } else{
                    req.flash('error_msg', 'Essa postagem não existe')
                res.redirect('/')
                }

            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro ao carregar a página')
                res.redirect('/')
            })
        })

    //categorias
        app.get('/categorias', (req, res) => {
            Categoria.find().sort({nome : 'asc'}).then((categorias) => {
                
                if(categorias){
                    res.render('categorias/index', {categorias : categorias})
                } else{
                    req.flash('error_msg', 'Nenhuma categoria foi registrada')
                    res.redirect('/')
                }
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro ao listar as categorias')
                res.redirect('/')
            })
        })

    //lista de postagens por categorias
        app.get('/categorias/:slug', (req, res) => {
            Categoria.findOne({slug : req.params.slug}).then((categoria) => {

                //verifica se encontrou a categoria
                if(categoria){
                    
                    Postagem.find({categoria : categoria._id}).sort({data : 'desc'}).then((postagens) => {
                       
                        res.render('categorias/postagens', {postagens : postagens, categoria : categoria})
                        
                    }).catch((erro) => {
                        req.flash('error_msg', 'Houve um erro ao listar as postagens dessa categoria')
                        res.redirect('/')
                    })

                } else{
                    req.flash('error_msg', 'Categoria não encontrada')
                    res.redirect('/')
                }
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro ao carregar a página')
                res.redirect('/')
            })
        })

    //rota 404
        app.get('/404', (req, res) => {
            res.send('Erro 404!')
        })

    //administrativas
        app.use('/admin', admin)
    
    //usuários
        app.use('/usuario', usuario)
    
    //login
    app.get('/login', (req, res) => {
        res.render('usuario/login')
    })


//outros

    //server
        const PORT = 8081
        app.listen(PORT, () => {
            console.log(`Servidor express rodando na porta ${PORT}...`)
        })