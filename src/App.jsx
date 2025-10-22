import List from './components/List'
import { DndContext } from '@dnd-kit/core'

function App() {

  return (
    <DndContext>
    <List />
    </DndContext>
  )
}

export default App