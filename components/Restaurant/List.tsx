// import { useQuery } from "@apollo/react-hooks";
import { gql, useQuery } from "@apollo/client";

import Link from "next/link";

import {
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Row,
  Col,
} from "reactstrap";

const QUERY = gql`
  {
    restaurants {
      data {
        id
        attributes {
          name
          description
          image {
            data {
              attributes {
                url
              }
            }
          }
        }
      }
    }
  }
`;

interface Props {
  search: string;
};
interface RestaurantImage {
  data: {
    attributes: {
      url: string;
    }
  }[]
}
interface RestaurantProps {
  id: number;
  attributes: {
    image: RestaurantImage;
    name: string;
    description: string;
  }
}

function RestaurantList({ search }: Props) {
  const { loading, error, data } = useQuery(QUERY);
  if (error) return <h2>Error loading restaurants</h2>;
  //if restaurants are returned from the GraphQL query, run the filter query
  //and set equal to variable restaurantSearch
  if (loading) return <h1>Fetching</h1>;
  if (data.restaurants.data && data.restaurants.data.length) {
    //searchQuery
    const searchQuery = data.restaurants.data.filter((query: { attributes: { name: string; } }) =>
      !query.attributes.name || query.attributes.name.toLowerCase().includes(search)
    );
    if (searchQuery.length != 0) {
      return (
        <Row>
          {searchQuery.map((res: RestaurantProps) => (
            <Col xs="6" sm="4" key={res.id}>
              <Card style={{ margin: "0 0.5rem 20px 0.5rem" }}>
                <CardImg
                  top={true}
                  style={{ height: 250 }}
                  src={`${process.env.NEXT_PUBLIC_API_URL}${res.attributes.image.data[0].attributes.url}`}
                />
                <CardBody>
                  <CardTitle>{res.attributes.name}</CardTitle>
                  <CardText>{res.attributes.description}</CardText>
                </CardBody>
                <div className="card-footer">
                  <Link
                    as={`/restaurants/${res.id}`}
                    href={`/restaurants?id=${res.id}`}
                  >
                    <a className="btn btn-primary">View</a>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}

          <style jsx global>
            {`
              a {
                color: white;
              }
              a:link {
                text-decoration: none;
                color: white;
              }
              a:hover {
                color: white;
              }
              .card-columns {
                column-count: 3;
              }
            `}
          </style>
        </Row>
      );
    } else {
      return <h1>No Restaurants Found</h1>;
    }
  }
  return <h5>Add Restaurants</h5>;
}

// export async function getServerSideProps() {
//   const { data } = await client.query({ query: QUERY });
  
//   return {
//     props: {
//       restaurants: data,
//       search: '',
//     }
//   };
// }
export default RestaurantList;