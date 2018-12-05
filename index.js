const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())

app.use(express.static('build'))

app.use(bodyParser.json())

//app.use(morgan('tiny'))

morgan.token('id', function getId(req) {
  console.log(JSON.stringify(req.body))
  return JSON.stringify(req.body)
})

var loggerFormat = ':method :url :id :status :res[content-length] - :response-time';

app.use(morgan(loggerFormat, {
  skip: function (req, res) {
    return res.statusCode < 400
  },
  stream: process.stderr
}))

app.use(morgan(loggerFormat, {
  skip: function (req, res) {
      return res.statusCode >= 400
  },
  stream: process.stdout
}))

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Martti Tienari",
    number: "040-123456",
    id: 2
  },
  {
    name: "Arto Järvinen",
    number: "040-123456",
    id: 3
  },
  {
    name: "Lea Kutvonen",
    number: "040-123456",
    id: 4
  }
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  
  res.send('<p>puhelinluettelossa ' + persons.length + ' henkilön tiedot</p> <p>' + Date() + '</p>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id )
  if ( person ) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  //const maxId = persons.length > 0 ? persons.map(p => p.id).sort((a,b) => a - b).reverse()[0] : 1
  const id = Math.floor(Math.random() * 1000)
  console.log(id)
  return id
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(body)
  
  if (body.name === undefined || body.number === undefined) {
    console.log('nimi tahi numero tyhjä')
    return response.status(404).json({error: 'name or number missing'})
  }

  if (persons.map(person => person.name).includes(body.name)) {
    console.log('nimi ei uniikki')
    return response.status(409).json({error: 'name must be unique'})
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
