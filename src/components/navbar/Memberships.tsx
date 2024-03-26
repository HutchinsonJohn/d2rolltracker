import styled from 'styled-components'
import {
  useAccountState,
  useAccountUpdateDefaultMembership,
} from '../../context/AccountStateContext'

const MembershipButton = styled.button<{ active?: boolean }>`
  all: 'unset';
  background: none;
  border: 2px solid transparent;
  ${({ active }) => active && 'border: 2px solid white;'}

  :hover {
    filter: brightness(1.2);
  }
`

const MembershipIconImg = styled.img`
  object-fit: contain;
`

export default function Memberships() {
  const accountState = useAccountState()
  const accountUpdateDefaultMembership = useAccountUpdateDefaultMembership()
  return accountState.destinyMembershipsDetails.length > 1 ? (
    <div>
      {accountState.destinyMembershipsDetails.map((membership) => (
        <MembershipButton
          type="button"
          key={membership.membershipId}
          active={
            accountState.defaultDestinyMembershipId === membership.membershipId
          }
          onClick={() => {
            accountUpdateDefaultMembership(
              membership.membershipId,
              membership.membershipType,
            )
          }}
        >
          <MembershipIconImg
            src={`https://www.bungie.net${membership.iconPath}`}
            alt={membership.iconPath.slice(
              membership.iconPath.lastIndexOf('/') + 1,
            )}
            height={25}
            width={25}
          />
        </MembershipButton>
      ))}
    </div>
  ) : null
}
