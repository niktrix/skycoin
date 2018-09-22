import "isomorphic-fetch"
import * as fs from "fs"

const API_URL = "http://127.0.0.1:6420"
const API_VERSION = "/api/v1"

const HEALTH = "/health"
const NETWORK_CONNECTION = "/network/connections"
const PROGRESS = "/blockchain/progress"

let last_synced_block = 0
let last_synced_block_time = new Date()
let start_node_sync = new Date()
let end_node_sync = new Date()

let logs:any =[]




let not_synced = 0


setInterval(async ()=>{
    
   let network:any = await getNetworkConnections()
   let progress:any = await getProgress()
   let health:any =  await  getHealth()

   last_synced_block = parseInt(health.blockchain.head.seq)

log("Total network connections",network.connections.length)
 
 

// check if 3 network connections  are there
  if ( network.connections.length >= 3){
    if(progress.highest == last_synced_block){
        log("Chain is synced ")
        end_node_sync = new Date()
        createReport()
      }else{
        let time = new Date().getTime() - last_synced_block_time.getTime() 
         log("Blocks are synching")
         log("Last block number",last_synced_block)
         log("Last block number Time taken to sync ",time/1000)
        last_synced_block = parseInt(health.blockchain.head.seq)
      }
  }

},3000)

// Keep eye on last synced block
setInterval(async ()=>{
    let health:any =  await  getHealth()
    if( last_synced_block <=  parseInt(health.blockchain.head.seq) ){
         log("Not recived new block for some time failed times", not_synced)
        not_synced ++
    }else{
        not_synced =0
        last_synced_block = parseInt(health.blockchain.head.seq)
    }
  },30000)

function getHealth(): Promise<any> {
    return new Promise((resolve, reject) => {
        Call(HEALTH)
        .then(response => {
        response.json().then((json:any) => {
            return resolve(json);
          })
        })
        .catch((error)=>{
          return reject(error);
        })
      })
}

function getProgress(): Promise<any> {
    return new Promise((resolve, reject) => {
        Call(PROGRESS)
        .then(response => {
        response.json().then((json:any) => {
            return resolve(json);
          })
        })
        .catch((error)=>{
          return reject(error);
        })
      })
}

function getNetworkConnections(): Promise<any> {
    return new Promise((resolve, reject) => {
      Call(NETWORK_CONNECTION)
      .then(response => {
      response.json().then((json:any) => {
          return resolve(json);
        })
      })
      .catch((error)=>{
        return reject(error);
      })
    })
  }

function Call(endpoint: string): Promise<any> {
  return fetch(API_URL + API_VERSION + endpoint);
}

function log(...args: any[]){
    logs.push(...args)
    console.log(...args)
}


function createReport(){
    let jsonReport:any
    jsonReport.nodeSyncTime = (end_node_sync.getTime() - start_node_sync.getTime())/1000
    jsonReport.logs = logs
    fs.writeFile("log.txs",jsonReport,(err)=>{
        throw new Error("Exiting process")
    })

 }