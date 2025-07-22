// db structures common functions: output table and table list

import * as Mdl from './model'
import * as Hlpr from './helper'

// number of model output tables
export const tableCount = (md) => {
  if (!Mdl.isModel(md)) return 0
  if (!md.hasOwnProperty('TableTxt')) return 0
  return Hlpr.lengthOf(md.TableTxt)
}

// is model has output table text list and each element is Table
export const isTableTextList = (md) => {
  if (!Mdl.isModel(md)) return false
  if (!Array.isArray(md.TableTxt)) return false
  for (let k = 0; k < md.TableTxt.length; k++) {
    if (!isTable(md.TableTxt[k].Table)) return false
  }
  return true
}

// return true if this is non empty Table: Name and Digest not empty and it also has TableId and ExprPos
export const isTable = (t) => {
  if (!t) return false
  if (!t.hasOwnProperty('TableId') || !t.hasOwnProperty('Name') || !t.hasOwnProperty('Digest') || !t.hasOwnProperty('ExprPos')) return false
  return (t.Name || '') !== '' && (t.Digest || '') !== ''
}

// if this is not empty TableTxt: it has TableId, Name, Digest, arrays of TableDimsTxt TableExprTxt, TableAccTxt and language, descrption, notes text
export const isNotEmptyTableText = (tt) => {
  if (!tt) return false
  if (!tt.hasOwnProperty('Table')) return false
  if (!isTable(tt.Table)) return false
  return tt.hasOwnProperty('TableDescr') && tt.hasOwnProperty('TableNote') && tt.hasOwnProperty('ExprDescr') && tt.hasOwnProperty('ExprNote') &&
  Array.isArray(tt.TableDimsTxt) && Array.isArray(tt.TableExprTxt) && Array.isArray(tt.TableAccTxt)
}

// return empty TableTxt
export const emptyTableText = () => {
  return {
    Table: {
      TableId: 0,
      Name: '',
      Digest: '',
      ImportDigest: '',
      ExprPos: 0
    },
    TableDimsTxt: [],
    TableExprTxt: [],
    TableAccTxt: [],
    LangCode: '',
    TableDescr: '',
    TableNote: '',
    ExprDescr: '',
    ExprNote: ''
  }
}

// find output TableTxt by id
export const tableTextById = (md, nId) => {
  if (!Mdl.isModel(md) || nId < 0) { // model empty or table id invalid: return empty result
    return emptyTableText()
  }
  for (let k = 0; k < md.TableTxt.length; k++) {
    if (!isTable(md.TableTxt[k].Table)) continue
    if (md.TableTxt[k].Table.TableId === nId) return md.TableTxt[k]
  }
  return emptyTableText() // not found
}

// find output TableTxt by name
export const tableTextByName = (md, name) => {
  if (!Mdl.isModel(md) || (name || '') === '') { // model empty or name empty: return empty result
    return emptyTableText()
  }
  for (let k = 0; k < md.TableTxt.length; k++) {
    if (!isTable(md.TableTxt[k].Table)) continue
    if (md.TableTxt[k].Table.Name === name) return md.TableTxt[k]
  }
  return emptyTableText() // not found
}

// return empty table size
export const emptyTableSize = () => {
  return {
    rank: 0,
    exprCount: 0,
    accCount: 0,
    allAccCount: 0,
    dimTotal: 0,
    dimSize: []
  }
}

// find output table size by name or empty value
export const tableSizeByName = (md, name) => {
  // if this is not output table then size =empty value
  let ret = emptyTableSize()
  const t = tableTextByName(md, name)
  if (!isTable(t.Table)) return ret

  // count of dimensions, expressions and accumulatotrs: table rank must be same as dimension count
  if (t.hasOwnProperty('TableDimsTxt')) {
    if ((t.Table.Rank || 0) !== (t.TableDimsTxt.length || 0)) return ret
    ret.rank = (t.Table.Rank || 0)
  }
  if (t.hasOwnProperty('TableExprTxt')) ret.exprCount = (t.TableExprTxt.length || 0)
  if (t.hasOwnProperty('TableAccTxt')) ret.allAccCount = (t.TableAccTxt.length || 0)
  if (ret.allAccCount > 0) {
    ret.accCount = ret.allAccCount
    for (let k = 0; k < ret.allAccCount; k++) {
      if (ret.accCount > 0 && t.TableAccTxt[k].hasOwnProperty('Acc') && !!t.TableAccTxt[k].Acc.IsDerived) ret.accCount--
    }
  }

  // multiply all dimension sizes, include "total" item, assume =1 for built-in types
  ret.dimTotal = 1
  for (let k = 0; k < t.TableDimsTxt.length; k++) {
    if (!t.TableDimsTxt[k].hasOwnProperty('Dim')) {
      ret = emptyTableSize()
      return ret
    }
    ret.dimSize.push(t.TableDimsTxt[k].Dim.DimSize || 0)
    if (ret.dimSize[k] > 0) ret.dimTotal *= ret.dimSize[k]
  }
  return ret
}
