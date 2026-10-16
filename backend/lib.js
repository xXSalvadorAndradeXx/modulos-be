const crypto=require('node:crypto');const {pool}=require('./config/database');
const fail=(code,message)=>Object.assign(new Error(message),{status:code});
const money=n=>Number(Number(n).toFixed(2));
const token=()=>crypto.randomBytes(32).toString('hex');
const hash=s=>crypto.createHash('sha256').update(String(s)).digest('hex');
function secureEqual(a,b){const x=Buffer.from(String(a||''));const y=Buffer.from(String(b||''));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
function db(){if(!pool)throw fail(503,'Configura DATABASE_URL');return pool}
async function tx(callback){const client=await db().connect();try{await client.query('BEGIN');const result=await callback(client);await client.query('COMMIT');return result}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}}
async function getQuote(id,key,q=db()){const r=await q.query('SELECT * FROM quotes WHERE id=$1',[id]);if(!r.rowCount)throw fail(404,'Cotización inexistente');if(!secureEqual(r.rows[0].access_hash,hash(key||'')))throw fail(403,'Acceso denegado');return r.rows[0]}
async function getOrder(id,key,q=db()){const r=await q.query('SELECT o.*,q.access_hash,q.number AS quote_number FROM orders o JOIN quotes q ON o.quote_id=q.id WHERE o.id=$1',[id]);if(!r.rowCount)throw fail(404,'Pedido inexistente');if(!secureEqual(r.rows[0].access_hash,hash(key||'')))throw fail(403,'Acceso denegado');return r.rows[0]}
function customerKey(req){return req.get('x-access-token')||''}
function admin(req){const key=process.env.ADMIN_API_KEY||'';if(key.length<32||!secureEqual(req.get('x-admin-key'),key))throw fail(403,'Acceso de administración denegado')}
module.exports={fail,money,token,hash,secureEqual,db,tx,getQuote,getOrder,customerKey,admin};
