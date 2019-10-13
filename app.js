var express = require('express'),
    //path = require('path'),
    nodeMailer = require('nodemailer'),
    bodyParser = require('body-parser');

var app = express();
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
var port = 80;
    app.get('/', function (req, res) {
        res.render('index');
    });
    app.post('/send-email', function (req, res) {
var name,email,phone,message;
    name = req.body.name;
    email = req.body.email;
    phone = req.body.phone;
    message = req.body.message;

    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'andre.raden@gmail.com',
            pass: 'rhcljbuhbkxreebs'
        }
    });
    let mailOptions = {
        from: '"WebForm" <smoeone@gmail.com>', // sender address
        to: 'andre.raden+webform@gmail.com',//,req.body.to, // list of receivers
        subject: 'Contact Me WebForm',//req.body.subject, // Subject line
        //text: req.body.body, // plain text body
        html: '<b>Name: </b>'+ name + '<br><b>Email:</b> '+ email + '<br><b>Phone#: </b>' + phone + '<br><b>Message: </b>' + message // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        res.end("Mail sent successefully");
        console.log('Message %s sent: %s', info.messageId, info.response);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
        app.listen(port, function(){
        console.log('Server is running at port: ',port);
        });