import React from 'react';
import { Box, Container, Grid } from 'theme-ui';
import BlockTitle from 'components/block-title';
import ServiceCard from 'components/cards/service-card';
import serviceImage1 from 'assets/service-1.png';
import serviceImage2 from 'assets/service-2.png';
import serviceImage3 from 'assets/service-3.png';
import serviceImage4 from 'assets/service-4.png';
import serviceImage5 from 'assets/service-5.png';
import serviceImage6 from 'assets/service-6.png';

const SERVICES_DATA = [
  {
    image: serviceImage1,
    text:
      'Innovative Design',
    heading: 'Innovative Design',
    path: '#',
  },
  {
    image: serviceImage2,
    text:
      'Combat Ready',
    heading: 'Combat Ready',
    path: '#',
  },
  {
    image: serviceImage3,
    text:
      'Play To Earn',
    heading: 'Play To Earn',
    path: '#',
  },
  {
    image: serviceImage4,
    text:
      'Play To Earn',
    heading: 'Play To Earn',
    path: '#',
  },
  {
    image: serviceImage5,
    text:
      'Innovative Design',
    heading: 'Innovative Design',
    path: '#',
  },
  {
    image: serviceImage6,
    text:
      'Combat Ready',
    heading: 'Combat Ready',
    path: '#',
  },
];
const Services = () => {
  return (
    <Box as="section" id="services" sx={styles.services}>
      <Container>
        <BlockTitle
          title="Features of Pet Dinosaur"
          text="Features are highlighted here"
        />
        <Grid sx={styles.grid}>
          {SERVICES_DATA.map(({ image, text, heading }, index) => (
            <ServiceCard
              image={image}
              text={text}
              heading={heading}
              // path={path}
              key={index}
            />
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Services;

const styles = {
  services: {
    pt: ['80px', null, null, null, '80px', null, '100px'],
  },
  grid: {
    gridGap: '30px',
    gridTemplateColumns: ['1fr', null, null, '1fr 1fr', null, '1fr 1fr 1fr'],
  },
};
