import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: 1,
    address: 'low-cost',
    city: 'Keffi',
    price: 3500000,
    property_type: PropertyType.RESIDENTIAL,
    image:
      'https://res.cloudinary.com/damtrix/image/upload/v1687251066/propertyCategories/bungalow1_wbf2sr.jpg',
    number_of_Bedrooms: 6,
    number_of_Bathrooms: 5,
    images: [
      {
        url: 'https://res.cloudinary.com/damtrix/image/upload/v1687251066/propertyCategories/bungalow1_wbf2sr.jpg',
      },
    ],
  },
];

const mockHome = {
  id: 1,
  address: 'low-cost',
  city: 'Keffi',
  price: 3500000,
  property_type: PropertyType.RESIDENTIAL,
  image:
    'https://res.cloudinary.com/damtrix/image/upload/v1687251066/propertyCategories/bungalow1_wbf2sr.jpg',
  number_of_Bedrooms: 6,
  number_of_Bathrooms: 5,
};

const mockImages = [
  {
    id: 1,
    url: 'https://res.cloudinary.com/damtrix/image/upload/v1687251066/propertyCategories/bungalow1_wbf2sr.jpg',
  },
  {
    id: 2,
    url: 'https://res.cloudinary.com/damtrix/image/upload/v1687251066/propertyCategories/bungalow1_wbf2sr.jpg',
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'adegbayi',
      price: {
        gte: 7000000,
        lte: 1000000,
      },
      property: PropertyType.RESIDENTIAL,
    };

    it('Should call prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: filters,
      });
    });

    it('Should throw not found exception if not homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });

    describe('createHome', () => {
      const mockCreateHomeParams = {
        address: 'low-cost',
        numberOfBathrooms: 4,
        numberOfBedrooms: 6,
        city: 'Keffi',
        landSize: 3346,
        propertyType: PropertyType.CONDO,
        price: 2000000,
        images: [
          {
            url: 'https://res.cloudinary.com/damtrix/image/upload/v1687251066/propertyCategories/bungalow1_wbf2sr.jpg',
          },
        ],
      };

      it('Should call prisma home.create with the correct payload', async () => {
        const mockCreateHome = jest.fn().mockReturnValue(mockHome);

        jest
          .spyOn(prismaService.home, 'create')
          .mockImplementation(mockCreateHome);

        await service.createHome(mockCreateHomeParams, 5);

        expect(mockCreateHome).toBeCalledWith({
          data: {
            address: 'low-cost',
            number_of_bathrooms: 4,
            number_of_bedrooms: 6,
            city: 'Keffi',
            land_size: 3346,
            propertyType: PropertyType.CONDO,
            price: 2000000,
            realtor_id: 5,
          },
        });
      });

      it('Should call prisma image.createMany with the correct payload', async () => {
        const mockCreateManyImage = jest.fn().mockReturnValue(mockImages);

        jest
          .spyOn(prismaService.image, 'createMany')
          .mockImplementation(mockCreateManyImage);

        await service.createHome(mockCreateHomeParams, 5);

        expect(mockCreateManyImage).toBeCalledWith({
          data: [
            {
              url: 'https://res.cloudinary.com/damtrix/image/upload/v1687251066/propertyCategories/bungalow1_wbf2sr.jpg',
              home_id: 1,
            },
          ],
        });
      });
    });
  });
});
