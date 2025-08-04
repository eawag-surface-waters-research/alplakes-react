//
//  GNController.h
//  Pods
//
//  Created by Kevin Mercado on 9/6/24.
//

#import <Foundation/Foundation.h>

@protocol GNController;

@protocol GNController<NSObject>

- (void)triggerEvent:(NSString *)eventName;

@end
