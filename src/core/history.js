import { deepClone } from './utils.js'

export class HistoryManager {
  constructor(limit=80){ this.limit=limit; this.undoStack=[]; this.redoStack=[]; this.listeners=new Set() }
  push(state,label='변경'){
    this.undoStack.push({state:deepClone(state),label}); if(this.undoStack.length>this.limit)this.undoStack.shift();
    this.redoStack=[]; this.emit()
  }
  undo(current){ if(!this.undoStack.length)return null; const prev=this.undoStack.pop(); this.redoStack.push({state:deepClone(current),label:prev.label}); this.emit(); return deepClone(prev.state) }
  redo(current){ if(!this.redoStack.length)return null; const next=this.redoStack.pop(); this.undoStack.push({state:deepClone(current),label:next.label}); this.emit(); return deepClone(next.state) }
  list(){ return this.undoStack.map(x=>x.label) }
  clear(){ this.undoStack=[];this.redoStack=[];this.emit() }
  on(fn){ this.listeners.add(fn); return ()=>this.listeners.delete(fn) }
  emit(){ for(const fn of this.listeners)fn(this) }
}
