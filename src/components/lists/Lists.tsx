import { useQuery } from 'react-query'
import styled from 'styled-components'
import { getPopularLists } from '../../api/lists'
import CreateList from './CreateList'
import List from './List'

const ListsDiv = styled.div`
  width: 100%;
  height: 100%;
  padding: 0.5rem;
`

const ListsGrid = styled.div`
  display: grid;
  grid-template-columns: auto 200px 200px 0px;
  grid-gap: 20px;
  max-width: 1200px;
  height: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid #ccc;
`

export default function Lists() {
  const listsQuery = useQuery('publicLists', async () => {
    const lists = await getPopularLists(0)
    return lists
  })

  return (
    <>
      <ListsDiv>
        <h2>Popular Lists</h2>
        <ListsGrid>
          <div>List Name</div>
          <div>Subscribers</div>
          <div>Created By</div>
        </ListsGrid>
        {listsQuery.data?.map((list) => (
          <List key={list.listId} listId={list.listId} />
        ))}
      </ListsDiv>
      <CreateList />
    </>
  )
}
