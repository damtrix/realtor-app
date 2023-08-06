import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PropertyType } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 53,
  name: 'Damola',
  email: 'oludamola.onarinde@gmail.com',
  phone: '(816) 363 5839',
};

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

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome),
          },
        },
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHomes', () => {
    it('SHould construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);

      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);

      await controller.getHomes('low-cost', '1000000');

      expect(mockGetHomes).toBeCalledWith({
        city: 'low-cost',
        price: {
          gte: 1000000,
        },
      });
    });
  });

  describe('updateHome', () => {
    const mockUserInfo = {
      name: 'Damola',
      id: 30,
      iat: 1,
      exp: 2,
    };

    const mockUpdateHomeParams = {
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

    it('Should throw unauth error if realtor didnt create home', async () => {
      await expect(
        controller.updateHome(60, mockUpdateHomeParams, mockUserInfo),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('Should update home if realtor id is valid', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(homeService, 'updateHomeById')
        .mockImplementation(mockUpdateHome);

      await controller.updateHome(5, mockUpdateHomeParams, {
        ...mockUserInfo,
        id: 53,
      });

      expect(mockUpdateHome).toBeCalled();
    });
  });
});
