// db structures common functions: workset and workset list
// workset is a set of model input parameters (a.k.a. input scenario)

import * as Hlpr from './helper'

// workset count: number of worksettext entries in workset text list
export const worksetTextCount = (wtl) => {
  return isWorksetTextList(wtl) ? wtl.length : 0
}

// if this is workset
export const isWorkset = (ws) => {
  if (!ws) return false
  if (!ws.hasOwnProperty('ModelName') || !ws.hasOwnProperty('ModelDigest')) return false
  if (!ws.hasOwnProperty('Name')) return false
  if (!ws.hasOwnProperty('IsReadonly') || !ws.hasOwnProperty('BaseRunDigest') || !ws.hasOwnProperty('UpdateDateTime')) return false
  if (!Array.isArray(ws.Param)) return false
  return true
}

// if this is workset text
export const isWorksetText = (wt) => {
  if (!isWorkset(wt)) return false
  if (!Array.isArray(wt.Txt)) return false
  return true
}

// if this is not empty workset text: model name, digest and workset name not empty
export const isNotEmptyWorksetText = (wt) => {
  if (!isWorksetText(wt)) return false
  return (wt.ModelName || '') !== '' && (wt.ModelDigest || '') !== '' && (wt.Name || '') !== ''
}

// return empty workset text
export const emptyWorksetText = () => {
  return {
    ModelName: '',
    ModelDigest: '',
    Name: '',
    IsReadonly: false,
    BaseRunDigest: '',
    UpdateDateTime: '',
    Param: [],
    Txt: []
  }
}

// workset count: number of worksettext entries in workset text list
export const worksetParamCount = (ws) => {
  return isWorkset(ws) ? Hlpr.lengthOf(ws.Param) : 0
}

// if this is a workset status db row
export const isWorksetStatus = (ws) => {
  if (!ws) return false
  if (!ws.hasOwnProperty('ModelDigest')) return false
  if (!ws.hasOwnProperty('Name') || !ws.hasOwnProperty('IsReadonly') || !ws.hasOwnProperty('UpdateDateTime')) return false
  return (ws.ModelDigest || '') !== '' && (ws.Name || '') !== '' && (typeof ws.IsReadonly === typeof true) && (ws.UpdateDateTime || '') !== ''
}

// return true if each list element isWorksetText()
export const isWorksetTextList = (wtl) => {
  if (!wtl) return false
  if (!Array.isArray(wtl)) return false
  for (let k = 0; k < wtl.length; k++) {
    if (!isWorksetText(wtl[k])) return false
  }
  return true
}

// return true if parameter name found in workset
export const isWorksetParamByName = (ws, name) => {
  if (!worksetParamCount(ws) || !name) return false
  for (let k = 0; k < ws.Param.length; k++) {
    if ((ws.Param[k]?.Name || '') === name) return true
  }
  return false // not found
}
