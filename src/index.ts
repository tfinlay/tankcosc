import SourceMapSupport from 'source-map-support'
import { OBSERVER_KEY } from './global'
import { server } from './server/server'
import { runGameTick } from './tick/tick'

import './server/routes'
import './server/io'

SourceMapSupport.install()

server.listen(3000, () => {  
    console.log('listening on *:3000')
    console.log(`Observer key is: ${OBSERVER_KEY}`)

    runGameTick()
})